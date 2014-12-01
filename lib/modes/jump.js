var chalk = require('chalk');

var clear = '\033[2J',
    up = function(n) { return '\033[' + n + 'A'; };

// cancel: onDone(null)
// complete: onDone(null, song)

function JumpMode(opts) {

  function redraw(line, forceClear) {

    console.log(
      clear + up(1) +
      chalk.white(
        '? ' + line + '\n' +
        '*********************************'
      )
    );

        selectedSong = song;


    var rows = list(playlist.search(line), selectedSong, process.stdout.columns, process.stdout.rows, utf8);
    process.stdout.write(rows.join('\n') + '\n');

    if (listIndex > items.length) {
      listIndex = 0;
    }

  }


  var playlist = opts.playlist,
      listIndex = 0,
      selectedSong = playlist.current(),
      line = '',
      items = [],
      onDone;

  var dispatch = {
    escape: function() {
      if (onDone) {
        onDone(null);
        onDone = null;
      }
    },
    enter: function() {
      if (onDone) {
        onDone(null, selectedSong);
        onDone = null;
      }
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
    backspace: function() { line = line.substr(0, line.length - 1); }
  };

  this.reset = function(doneFn) {
    listIndex = 0;
    selectedSong = playlist.current();
    line = '';
    items = [];
    onDone = doneFn;
  };

  this.keypress = function(ch, key) {
    if (!key) {
      return false;
    }
    if (key.name.length == 1) {
      line += key.name;
    } else if (key && key.name && dispatch[key.name]) {
      dispatch[key.name]();
    }
    redraw(line);
    return true;
  };

  this.redraw = function(forceClear) { redraw(line, forceClear); };
}

module.exports = JumpMode;
