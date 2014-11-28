var keypress = require('keypress'),
    playSong = require('./play-song.js'),
    Meta = require('./metadata.js'),
    commandMode = require('./modes/command.js'),
    jumpMode = require('./modes/jump.js');

// accepts multiple listeners
module.exports = function(playlist) {
  var inputMode = 'command';

  var listeners = [
      commandMode({ playlist: playlist }),
      jumpMode({ playlist: playlist })
  ];


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
      listeners[1](null, null, true);
      return;
    }

    var handled = false;

    if (inputMode === 'command') {
      handled = listeners[0](chunk, key);
    } else {
      handled = listeners[1](chunk, key, false, function(err, song) {
        inputMode = 'command';
        if (song) {
          playlist.jump(song);
          setTimeout(function() { listeners[0]('x', { name: 'x' }); }, 10); // play

          // FIXME if the song is not found need to reset the playlist filtering!
        }
      });
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
