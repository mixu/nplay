
var NormalMode = {
  next: function(playlist) { return playlist.current+1; },
  prev: function(playlist) { return playlist.current-1; },
};

var RepeatMode = {
  next: function(playlist) { return playlist.current; },
  prev: function(playlist) { return playlist.current; }
};

var ShuffleMode = {
  _list: [],
  _index: 0,
  init: function(playlist) {
    // pregenerate list, this allows for next() and prev() to work properly
    ShuffleMode._list = [];
    ShuffleMode._index = 0;
    for(var i = 0; i < playlist.songs.length; i++) {
      ShuffleMode._list.push(i);
    }
    // Apply fisher-yates
    var tmp, current, top = ShuffleMode._list.length;

    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = ShuffleMode._list[current];
      ShuffleMode._list[current] = ShuffleMode._list[top];
      ShuffleMode._list[top] = tmp;
    }
  },
  next: function(playlist) {
    ShuffleMode._index = Math.max(0, Math.min(ShuffleMode._list.length-1, ShuffleMode._index + 1));
    return ShuffleMode._list[ShuffleMode._index];
  },
  prev: function(playlist) {
    ShuffleMode._index = Math.max(0, Math.min(ShuffleMode._list.length-1, ShuffleMode._index - 1));
    return ShuffleMode._list[ShuffleMode._index];
  }
};

function Playlist() {
  this.songs = [];
  this.current = 0;
  this.mode = NormalMode;
}

Playlist.prototype.add = function(track) {
  this.songs.push(track);
};

Playlist.prototype.prev = function() {
  console.log('Previous');
  this.set(this.mode.prev(this));
};

Playlist.prototype.next = function() {
  console.log('Next');
  this.set(this.mode.next(this));
};

Playlist.prototype.shuffle = function() {
  console.log('Set shuffle', (this.mode != ShuffleMode));
  if(this.mode != ShuffleMode) {
    ShuffleMode.init(this);
    this.mode = ShuffleMode;
  } else {
    this.mode = NormalMode;
  }
};

Playlist.prototype.set = function(index) {
  this.current = Math.max(0, Math.min(this.songs.length-1, index || 0));
};

Playlist.prototype.repeat = function() {
  console.log('Set repeat', (this.mode != RepeatMode));
  if(this.mode != RepeatMode) {
    this.mode = RepeatMode;
  } else {
    this.mode = NormalMode;
  }
};

Playlist.prototype.sort = function() {
  this.songs.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });
};

Playlist.prototype.search = function(line) {
  var results = [],
      search = line.split(" ").filter(function(element){return element.length > 0;});
  for(var i = 0; i < this.songs.length; i++) {
     var matches = [];
     for(var j = 0; j < search.length; j++) {
        var pos = this.songs[i].name.toLowerCase().indexOf(search[j]);
        if( pos > -1) {
          matches.push(pos);
        } else {
          break;
        }
     }
     if(matches.length == search.length) {
        results.push(i);
     } else {
        continue;
     }
  }

  return results;
};

module.exports = Playlist;
