var keypress = require('keypress'),
    playSong = require('./play-song.js'),
    Meta = require('./metadata.js');

// accepts multiple listeners
module.exports = function() {
  var listeners = Array.prototype.slice.call(arguments);

  keypress(process.stdin);
  process.stdin.on('keypress', function(chunk, key) {
    // handle ctrl+c
    if (key && key.ctrl && key.name == 'c') {
      Meta.write();
      playSong();
      process.exit();
      return;
    }
    // handle ctrl+z (c.f lib/readline.js in the core)
    if (key && key.ctrl && key.name == 'z') {
      if (process.platform == 'win32') {
        return;
      }
      process.once('SIGCONT', function() {
        // explicitly re-enable "raw mode"
        process.stdin.setRawMode(true);
      });
      process.stdin.setRawMode(false);
      process.kill(process.pid, 'SIGTSTP');
      return;
    }

    // handle mode toggle
    if (key && key.name == 'j') {
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
    }

    var i, handled = false;
    for (i = 0; i < listeners.length; i++) {
      handled = listeners[i](chunk, key);
      if (handled) {
        break; // handled it
      }
    }

    if (!handled) {
      console.log('Commands:');
      console.log('\tz - Previous');
      console.log('\tx - Play');
      console.log('\tc - Pause');
      console.log('\tv - Stop');
      console.log('\tb - Next');
      console.log('\ts - Shuffle mode');
      console.log('\tr - Repeat mode');
      console.log('\t1...5 - Rate song');
      console.log('\tf - Filter mode (ratings >= 3)');
      console.log('\tj - Jump');
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

};
