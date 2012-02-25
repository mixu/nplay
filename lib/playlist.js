function Playlist() {
  this._shuffle = false;
  this._repeat = false;
  this.songs = [];
}

Playlist.prototype.add = function(track) {
  this.songs.push(track);
};

Playlist.prototype.prev = function() {
  console.log('Previous');
  !this._repeat && selected--;
};

Playlist.prototype.next = function() {
  console.log('Next');
  if(shuffle) {
    selected = Math.floor(Math.random()*playlist.length);
  } else if(!repeat) {
    selected++;
  }
};

Playlist.prototype.shuffle = function() {
  this._shuffle = !this._shuffle;
  console.log('Set shuffle', this._shuffle);
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
