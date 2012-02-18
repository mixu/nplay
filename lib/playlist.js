function Playlist() {
  this.shuffle = false;
  this.repeat = false;
}

Playlist.prototype.prev = function() {
  console.log('Previous');
  !repeat && selected--;
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
  shuffle = !shuffle;
  console.log('Set shuffle', shuffle);
};

Playlist.prototype.repeat = function() {
  repeat = !repeat;
  console.log('Set repeat', repeat);
};

Playlist.prototype.sort = function() {
  function(a, b) {
    return a.filename.localeCompare(b.filename);
  });
};

Playlist.prototype.search = function(string) {
  var showed = 0;
  var search = current.split(" ").filter(function(element){return element.length > 0;});
  var matches = [];
  for(var i = 0; i < playlist.length; i++) {
     matches = [];
     for(var j = 0; j < search.length; j++) {
        var pos = playlist[i].name.toLowerCase().indexOf(search[j]);
        if( pos > -1) {
           matches.push(pos);
        } else {
          break;
        }
     }
     if(matches.length == search.length) {
      // found item
     } else {
        continue;
     }
  }

  return matches;
};

module.exports = Playlist;
