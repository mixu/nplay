var Playlist = null;

function JumpMode() { }

JumpMode.reset = function(playlist) {
  Playlist = playlist;

  JumpMode.listIndex = 0;
  JumpMode.selectedIndex = 0;
  JumpMode.line = '';
  JumpMode.done = false;

  JumpMode.onComplete = function(track) {};
  JumpMode.onCancel = function() {};
};

JumpMode.map = {
  escape: function() {
    JumpMode.done = true;
    JumpMode.onCancel();
  },
  enter: function() {
    JumpMode.done = true;
    JumpMode.selectedIndex = Math.max(0, Math.min(Playlist.songs.length-1, JumpMode.selectedIndex));
    JumpMode.onComplete(JumpMode.selectedIndex);
  },
  down: function() { JumpMode.listIndex++; },
  up: function() { JumpMode.listIndex--; },
  space: function() { JumpMode.line += ' '; },
  backspace: function() { JumpMode.line = JumpMode.line.substr(0, JumpMode.line.length-1); }
};

JumpMode.keypress = function(chunk, key) {
  if(!key) {
    return -1;
  }
  if(key.name.length == 1) {
    JumpMode.line += key.name;
  } else if(key && key.name && JumpMode.map[key.name]) {
    JumpMode.map[key.name]();
  }
  (JumpMode.done == false) && JumpMode.redraw(JumpMode.line);
};

JumpMode.redraw = function(line) {
  cli.clear()
     .up(1)
     .color('white')
     .write("? "+line+"\n")
     .write("*********************************\n");

  var items = Playlist.search(line);
  if(JumpMode.listIndex > items.length) {
    JumpMode.listIndex = 0;
  }

  items.forEach(function display(item, listIndex) {
    var song = Playlist.songs[item];

    if(JumpMode.listIndex == listIndex) {
      JumpMode.selectedIndex = item;
      cli.color('red', true);
    } else {
      cli.color('yellow');
    }
    console.log(song.name);
    cli.resetColor();
  });
}

module.exports = JumpMode;
