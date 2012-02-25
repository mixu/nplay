var tty = require('tty');
    path = require('path'),
    child_process = require('child_process'),

    cli = require('./node-cli.js'),
    PathIterator = require('./path_iterator.js'),

    Playlist = require('./playlist.js'),
    Track = require('./track.js'),
    JumpMode = require('./modes/jump_mode.js'),
    Meta = require('./metadata.js');

var current_volume = 35,
    decoder = null,
    selected = 0,
    playlist = new Playlist(),
    inputMode = 'command';

var CommandMode = {
  z: function() { Player.prev(); },
  x: function() { Player.play(); },
  c: function() { Player.pause(); },
  v: function() { Player.stop(); },
  b: function() { Player.next(); },
  s: function() { playlist.shuffle(); },
  r: function() { playlist.repeat(); },
  j: function() {
    inputMode = 'jump';
    console.log('? ');
    JumpMode.reset(playlist);
    JumpMode.onComplete = function(track) {
      inputMode = 'command';
      Player.play(track);
    };
    JumpMode.onCancel = function() {
      inputMode = 'command';
    };
  },
  up: function() {
    current_volume += 5;
    Player.volume(current_volume);
  },
  down: function() {
    current_volume -= 5;
    Player.volume(current_volume);
  }
};

function Player() { }

Player.play = function(position) {
  Player.stop();
  if(position) {
    selected = position;
  }
  selected = Math.max(0, Math.min(playlist.songs.length-1, selected));
  console.log('mpg123 '+playlist.songs[selected].filename);
  // '--gain', current_volume,
  decoder = child_process.spawn('mpg123', [ '-q', '--long-tag',  playlist.songs[selected].filename.replace(' ', '\ ') ]);
  decoder.stdout.pipe(process.stdout);
  decoder.stderr.pipe(process.stderr);
  decoder.on('exit', function (code) {
    if(code == 0) {
      Player.next();
    } else {
      console.log('child process exited with code ' + code);
    }
  });
};

Player.next = function() { Player.play(++selected); }
Player.prev = function() { Player.play(--selected); }

Player.pause = Player.stop = function() {
  decoder && (decoder.kill(), decoder = null);
};

Player.volume = function(volume) {
  current_volume = Math.max(0, Math.min(100, volume));
  Player.play();
};

Player.scan = function(directory) {
  var pi = new PathIterator();
  pi.on('file', function(filename, stats) {
    if(path.extname(filename) == '.mp3') {
      playlist.add(new Track(filename));
    }
  });
  pi.on('end', function() {
    playlist.sort();
//    console.log('Scan complete.');
//    console.log(playlist);
  });
  pi.iterate(directory, 100);
};


Player.run = function() {
  Meta.read('./db.json');

  process.stdin.resume();
  tty.setRawMode(true);
  process.stdin.on('keypress', function(chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
      Meta.write('./db.json');
      Player.stop();
      process.exit();
      return;
    }

    if (inputMode == 'jump') {
      JumpMode.keypress(chunk, key);
    } else if(key && key.name && CommandMode[key.name]) {
      CommandMode[key.name]();
    } else {
      console.log('Commands:');
      console.log("\tz - Previous");
      console.log("\tx - Play");
      console.log("\tc - Pause");
      console.log("\tv - Stop");
      console.log("\tn - Next");
      console.log("\ts - Shuffle");
      console.log("\tr - Repeat");
      console.log("\tj - Jump");
      console.log("\tup - Volume up");
      console.log("\tdown - Volume down");
    }
  });
}

module.exports = Player;
