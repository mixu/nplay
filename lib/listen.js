var keypress = require('keypress'),
    playSong = require('./play-song.js'),
    Meta = require('./metadata.js'),
    CommandMode = require('./modes/command.js'),
    JumpMode = require('./modes/jump.js');

// accepts multiple listeners
module.exports = function(playlist, config) {
  var inputMode = 'command';

  var listeners = [
      new CommandMode({ playlist: playlist, config: config }),
      new JumpMode({ playlist: playlist, config: config })
  ];

  process.stdout.on('resize', function() {
    if (inputMode === 'command') {
      listeners[0].redraw(true);
    } else {
      listeners[1].redraw(true);
    }
  });

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
      listeners[1].reset(function(err, song) {
        inputMode = 'command';
        if (song) {
          if (!playlist.hasSong(song)) {
            playlist.reset();
            // reset filtering, song is not in the current (filtered) playlist
            listeners[0].reset();
            // also reset the flags on the command mode
          }

          playlist.jump(song);
          listeners[0].keypress('x', { name: 'x' }); // play
        } else {
          // at least redraw on cancel
          listeners[0].redraw();
        }
      });
      listeners[1].redraw();
      return;
    }

    var handled = false;

    if (inputMode === 'command') {
      handled = listeners[0].keypress(chunk, key);
    } else {
      handled = listeners[1].keypress(chunk, key);
    }

    if (!handled) {
      console.log('Commands:');
      console.log('\tz - Previous');
      console.log('\tx, Enter - Play');
      console.log('\tc - Pause');
      console.log('\tv - Stop');
      console.log('\tb - Next');
      console.log('\ts - Shuffle mode (can combine with filter mode)');
      console.log('\tr - Repeat mode');
      console.log('\tf - Filter mode (ratings >= 3)');
      console.log('\tt - Top mode (sort by # played, then by rating; can combine with filter mode)');
      console.log('\tl - Last played mode (sort by last played)');
      console.log('\t1...5 - Rate song');
      console.log('\tj - Jump');
      console.log('\tUp/Down/Page Up/Page Down/Home/End - Move in the playlist');
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  // first render
  listeners[0].redraw();
};
