var tty = require('tty');
    path = require('path'),
    child_process = require('child_process'),

    NodeCli = require('./node-cli.js'),
    cli = new NodeCli(),

    PathIterator = require('./path_iterator.js');

var current_volume = 35,
    current_proc = null,
    selected = 0,
    playlist = new Playlist();

function Player() {

}

Player.play = function(position) {
  client.stop();
  if(position) {
    selected = position;
  }
  selected = Math.max(0, Math.min(playlist.length-1, selected));
  console.log('mpg123 '+playlist[selected].filename);
  // '--gain', current_volume,
  current_proc = child_process.spawn('mpg123', [ '-q', '--long-tag',  playlist[selected].filename.replace(' ', '\ ') ]);
  current_proc.stdout.pipe(process.stdout);
  current_proc.stderr.pipe(process.stderr);
  current_proc.on('exit', function (code) {
    if(code == 0) {
      client.next();
    } else {
      console.log('child process exited with code ' + code);
    }
  });
};

Player.prototype.pause = Player.prototype.stop = function() {
  current_proc && (current_proc.kill(), current_proc = null);
};

Player.prototype.volume = function(volume) {
  current_volume = Math.max(0, Math.min(100, volume));
  client.play();
};

Player.prototype.scan = function(directory) {
  var pi = new PathIterator();
  pi.on('file', function(filename, stats) {
    if(path.extname(filename) == '.mp3') {
      playlist.add(new Track(filename));
    }
  });
  pi.on('end', function() {
    playlist.sort();
    // console.log('Scan complete.');
  });
  pi.iterate(directory, 100);
};


Player.prototype.run = function() {
  var jump_mode = false;
  process.stdin.resume();
  tty.setRawMode(true);
  process.stdin.on('keypress', function(chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
      client.stop();
      process.exit();
      return;
    }

    if (jumpMode) {
      JumpMode.keypress(chunk, key);

      if(JumpMode.isComplete) {
        client.play(track);
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
