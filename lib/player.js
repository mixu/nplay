var tty = require('tty');
    path = require('path'),
    child_process = require('child_process'),

    cli = require('./node-cli.js'),
    PathIterator = require('./path_iterator.js'),

    Playlist = require('./playlist.js'),
    Track = require('./track.js'),
    CommandMode = require('./modes/command_mode.js'),
    JumpMode = require('./modes/jump_mode.js');

var current_volume = 35,
    decoder = null,
    selected = 0,
    playlist = new Playlist(),
    inputMode = 'command';


CommandMode.setClient(Player);
JumpMode.setClient(Player);

function Player() {

}

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
  client.play();
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
    console.log('Scan complete.');
    console.log(playlist);
  });
  pi.iterate(directory, 100);
};


Player.run = function() {
  process.stdin.resume();
  tty.setRawMode(true);
  process.stdin.on('keypress', function(chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
      Player.stop();
      process.exit();
      return;
    }

    if (inputMode == 'jump') {
      JumpMode.keypress(chunk, key);

      if(JumpMode.isComplete) {
        Player.play(track);
        jump_mode = false;
        cli.clear();
      } else if(JumpMode.isCancelled) {
        jump_mode = false;
        cli.clear();
      }

    } else {
      CommandMode.keypress(chunk, key);
    }
  });
}

module.exports = Player;
