var topSort = require('./top-sort');
// playlist keeps a single master list of songs
// and wraps method access
// when a mode like shuffle or filter is activated,
// - shallow copy the list using .slice(0)
// - ensure that the song at the top is the current song
// - replace the current (non master) list with the result from the function

function Playlist(master) {
  // do not modify the main list
  this._master = master;
  // this one is disposable
  this._list = master.slice(0);
  this._current = 0;
}

// prev and next advance the internal pointers and return the song

Playlist.prototype.prev = function() {
  this._current--;
  if (this._current < 0) {
    this._current = this._list.length - 1;
  }
  return this.current();
};

Playlist.prototype.next = function() {
  this._current++;
  if (this._current > this._list.length - 1) {
    this._current = 0;
  }
  return this.current();
};

Playlist.prototype.current = function() {
  this._current = Math.max(0, Math.min(this._list.length - 1, this._current));
  return this._list[this._current];
};

Playlist.prototype.context = function(lines) {
  if (this._list.length < lines) {
    return this._list;
  }

  var list = this._list,
      linesBefore = Math.floor((lines - 1) / 2),
      linesAfter = (lines - 1) - linesBefore,
      start = this._current - linesBefore,
      end = this._current + linesAfter + 1;

  var result = [];

  if (start < 0) {
    result = result.concat(list.slice(start, list.length))
                   .concat(list.slice(0, this._current));
  } else {
    result = result.concat(list.slice(start, this._current));
  }

  if (end > list.length) {
    result = result.concat(list.slice(this._current, list.length))
                   .concat(list.slice(0, end - list.length));
  } else {
    result = result.concat(list.slice(this._current, end));
  }
  return result;
};

// .jump(song) sets the internal pointer to a song, and returns the song

Playlist.prototype.jump = function(song) {
  if (typeof song !== 'number') {
    this._current = this._list.indexOf(song);
  } else {
    this._current = song;
  }
  this._current = Math.max(0, Math.min(this._list.length - 1, this._current));
  return this.current();
};

Playlist.prototype.hasSong = function(song) {
  return (this._list.indexOf(song) > -1);
};

Playlist.prototype.reset = function() {
  this.mode(function(playlist) { return playlist; });
};

Playlist.prototype.mode = function() {
  var oldSong = this.current();
  var callbacks = Array.prototype.slice.call(arguments);
  this._list = callbacks.reduce(function(playlist, modeCb) {
    return modeCb(playlist, oldSong);
  }, this._master.slice(0));
  return this.jump(oldSong);
};

Playlist.prototype.search = function(line) {
  var results = [],
      search = line.split(' ').filter(Boolean);
  for (var i = 0; i < this._master.length; i++) {
     var matches = [];
     for (var j = 0; j < search.length; j++) {
        var pos = this._master[i].name.toLowerCase().indexOf(search[j]);
        if (pos > -1) {
          matches.push(pos);
        } else {
          break;
        }
     }
     if (matches.length == search.length) {
        results.push(this._master[i]);
     } else {
        continue;
     }
  }

  // sort by played, rating
  return results.sort(topSort);
};

module.exports = Playlist;
