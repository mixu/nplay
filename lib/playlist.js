function Playlist() {
  this._shuffle = false;
  this._repeat = false;
  this.songs = [];
  this.current = 0;
  this._shuffleList = [];
  this._shuffleIndex = 0;
}

Playlist.prototype.add = function(track) {
  this.songs.push(track);
};

Playlist.prototype.prev = function() {
  console.log('Previous');
  if(this._shuffle) {
    this._shuffleIndex = Math.max(0, Math.min(this._shuffleList.length-1, this._shuffleIndex - 1));
    this.set(this._shuffleList[this._shuffleIndex]);
  } else {
    !this._repeat && this.set(this.current-1);
  }
};

Playlist.prototype.next = function() {
  console.log('Next');
  if(this._shuffle) {
    this._shuffleIndex = Math.max(0, Math.min(this._shuffleList.length-1, this._shuffleIndex + 1));
    this.set(this._shuffleList[this._shuffleIndex]);
  } else if(!this._repeat) {
    this.set(this.current+1);
  }
};

Playlist.prototype.shuffle = function() {
  this._shuffle = !this._shuffle;
  console.log('Set shuffle', this._shuffle);

  if(this._shuffle) {
    // pregenerate list, this allows for next() and prev() to work properly
    this._shuffleList = [];
    this._shuffleIndex = 0;
    for(var i = 0; i < this.songs.length; i++) {
      this._shuffleList.push(i);
    }
    // Apply fisher-yates
    var tmp, current, top = this._shuffleList.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = this._shuffleList[current];
        this._shuffleList[current] = this._shuffleList[top];
        this._shuffleList[top] = tmp;
    }
  }

};



Playlist.prototype.set = function(index) {
  this.current = Math.max(0, Math.min(this.songs.length-1, index || 0));
};

Playlist.prototype.repeat = function() {
  this._repeat = !this._repeat;
  console.log('Set repeat', this._repeat);
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
