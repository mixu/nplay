var chalk = require('chalk'),
    xtend = require('xtend'),
    jump = require('../templates/jump');

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
        '*********************************')
    );

    tracks = playlist.search(line).slice(0, Math.max(1, process.stdout.rows - 4));
    if (listIndex > tracks.length) {
      listIndex = 0;
    }
    selectedSong = tracks[listIndex];

    var rows = jump(xtend({
      tracks: tracks,
      current: selectedSong,
      line: line,
      maxCols: process.stdout.columns
    }, opts.config));

    process.stdout.write(rows.join('\n') + '\n');
  }

  var playlist = opts.playlist,
      listIndex, selectedSong, line, tracks, onDone;

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
      listIndex = Math.max(0, Math.min(tracks.length - 1, listIndex));
    },
    up: function() {
      listIndex--;
      listIndex = Math.max(0, Math.min(tracks.length - 1, listIndex));
    },
    space: function() { line += ' '; },
    backspace: function() { line = line.substr(0, line.length - 1); }
  };

  this.reset = function(doneFn) {
    listIndex = 0;
    line = '';
    tracks = playlist.search(line);
    selectedSong = tracks[0];
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

  this.reset(function() {});
}

module.exports = JumpMode;
