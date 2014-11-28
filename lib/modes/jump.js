var chalk = require('chalk');

var clear = '\033[2J',
    up = function(n) { return '\033[' + n + 'A' };

// cancel: onDone(null)
// complete: onDone(null, song)

module.exports = function(opts) {

  function redraw(line) {

    console.log(
      clear + up(1) +
      chalk.white(
        '? ' + line + '\n' +
        '*********************************'
      )
    );

    items = playlist.search(line);
    if(listIndex > items.length) {
      listIndex = 0;
    }

    items.slice(0, Math.max(1, process.stdout.rows - 3))
        .forEach(function display(song, searchIndex) {
      if(listIndex == searchIndex) {
        selectedSong = song;
        console.log( chalk.red.bold(song.name) );
      } else {
        console.log( chalk.yellow(song.name) );
      }
    });
  }


  var playlist = opts.playlist,
      listIndex = 0,
      selectedSong = playlist.current(),
      line = '',
      items = [];

  var dispatch = {
    escape: function(onDone) {
      onDone(null);
    },
    enter: function(onDone) {
      onDone(null, selectedSong);
    },
    down: function() {
      listIndex++;
      listIndex = Math.max(0, Math.min(items.length - 1, listIndex));
    },
    up: function() {
      listIndex--;
      listIndex = Math.max(0, Math.min(items.length - 1, listIndex));
    },
    space: function() { line += ' '; },
    backspace: function() { line = line.substr(0, line.length-1); }
  };

  return function(ch, key, reset, onDone) {
    if (reset) {
      listIndex = 0;
      selectedSong = playlist.current();
      line = '';
      items = [];
    }
    if (!key) {
      return false;
    }
    if (key.name.length == 1) {
      line += key.name;
    } else if(key && key.name && dispatch[key.name]) {
      dispatch[key.name](onDone);
    }
    redraw(line);
    return true;
  };

};
