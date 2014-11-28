var chalk = require('chalk');

var clear = '\033[2J',
    up = function(n) { return '\033[' + n + 'A' };

function redraw(line) {

  console.log(
    clear + up(1) +
    chalk.white(
      '? ' + line + '\n' +
      '*********************************'
    )
  );

  var items = Playlist.search(line);
  if(JumpMode.listIndex > items.length) {
    JumpMode.listIndex = 0;
  }

  items.some(function display(item, listIndex) {
    var song = Playlist.songs[item];

    if(JumpMode.listIndex == listIndex) {
      JumpMode.selectedIndex = item;
      console.log( chalk.red.bold(song.name) );
    } else {
      console.log( chalk.yellow(song.name) );
    }
    return (listIndex > process.stdout.rows);
  });
}

// cancel: onDone(null)
// complete: onDone(null, song)

module.exports = function(opts, onDone) {

  var playlist = opts.playlist,
      listIndex = 0,
      selectedIndex = 0,
      line = '';

  var dispatch = {
    escape: function() {
      onDone(null);
    },
    enter: function() {
      JumpMode.selectedIndex = Math.max(0, Math.min(Playlist.songs.length-1, JumpMode.selectedIndex));
      JumpMode.onComplete(JumpMode.selectedIndex);
    },
    down: function() { listIndex++; },
    up: function() { listIndex--; },
    space: function() { line += ' '; },
    backspace: function() { line = line.substr(0, line.length-1); }
  };

  return function(ch, key) {
    if (!key) {
      return false;
    }
    if (key.name.length == 1) {
      line += key.name;
    } else if(key && key.name && dispatch[key.name]) {
      dispatch[key.name]();
    }
    redraw(line);
    return true;
  };

};
