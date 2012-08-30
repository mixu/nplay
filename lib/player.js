var path = require('path'),
    child_process = require('child_process'),

    keypress = require('keypress'),
    cli = require('./node-cli.js'),
    FileGroup = require('./file_group.js'),
    Playlist = require('./playlist.js'),
    Track = require('./track.js'),
    JumpMode = require('./jump_mode.js'),
    Meta = require('./metadata.js');

var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

var current_volume = 35,
    decoder = null,
    playlist = new Playlist(),
    inputMode = 'command',
    fileGroup = new FileGroup();

var CommandMode = {
  z: function() { playlist.prev(); Player.play(); },
  x: function() { Player.play(); },
  c: function() { Player.pause(); },
  v: function() { Player.stop(); },
  b: function() { playlist.next(); Player.play(); },
  s: function() { playlist.shuffle(); },
  r: function() { playlist.repeat(); },
  f: function() { playlist.filter(); },
  j: function() {
    inputMode = 'jump';
    console.log('? ');
    JumpMode.reset(playlist);
    JumpMode.onComplete = function(track) {
      inputMode = 'command';
      playlist.set(track);
      Player.play(playlist.songs[track].filename);
    };
    JumpMode.onCancel = function() {
      inputMode = 'command';
    };
  },
  up: function() {
    Player.volume(current_volume + 5);
  },
  down: function() {
    Player.volume(current_volume - 5);
  }
};

function Player() { }

Player.play = function(filename) {
  Player.stop();
  if(!filename) {
    filename = playlist.songs[playlist.current].filename;
  }
  console.log(playlist.songs[playlist.current].filename, '[' + (playlist.songs[playlist.current].rating || '0') + ']');
  // '--gain', current_volume,
  if(path.extname(filename) == '.mp3') {
    decoder = child_process.spawn('mpg123', [ '-q', '--long-tag',  filename.replace(' ', '\ '), '--aggressive' ]);
  } else {
    decoder = child_process.spawn('mplayer', [ '-really-quiet', '-nolirc', filename.replace(' ', '\ ') ]);
  }
  decoder.stdout.pipe(process.stdout);
  decoder.stderr.pipe(process.stderr);
  decoder.on('exit', function (code) {
    if(code == 0) {
      playlist.next();
      Player.play();
    } else if(code != null) {
      console.log('child process exited with code ' + code);
    }
  });
};

Player.pause = Player.stop = function() {
  decoder && (decoder.kill(), decoder = null);
};

Player.volume = function(volume) {
  current_volume = Math.max(0, Math.min(100, volume));
  Player.play();
};

Player.scan = function(path) {
  fileGroup.include(path);
};

Player.run = function() {
  Meta.read(homePath+'/.nplay.db.json');

  fileGroup.resolve().forEach(function(filename) {
    var extension = path.extname(filename);
    if(['.mp3', '.wav', '.m4a'].some(function(ext) { return ext == extension; })) {
      playlist.add(new Track(filename));
    }
  });

  keypress(process.stdin);
  process.stdin.on('keypress', function(chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
      Meta.write(homePath+'/.nplay.db.json');
      Player.stop();
      process.exit();
      return;
    }

    if (inputMode == 'jump') {
      JumpMode.keypress(chunk, key);
    } else if(key && key.name && CommandMode[key.name]) {
      CommandMode[key.name]();
    } else if(['1', '2', '3', '4', '5'].indexOf(chunk) > -1) {
      console.log('Rate ', chunk);
      playlist.songs[playlist.current].rate(chunk);
      console.log(playlist.songs[playlist.current].name, '[' + (playlist.songs[playlist.current].rating || '0') + ']');
    } else {
      console.log('Commands:');
      console.log("\tz - Previous");
      console.log("\tx - Play");
      console.log("\tc - Pause");
      console.log("\tv - Stop");
      console.log("\tb - Next");
      console.log("\ts - Shuffle mode");
      console.log("\tr - Repeat mode");
      console.log("\t1...5 - Rate song");
      console.log("\tf - Filter mode (ratings >= 3)");
      console.log("\tj - Jump");
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

module.exports = Player;
