module.exports = function(playlist) {
  return playlist.filter(function(song) {
    return song.rating >= 3;
  }).sort(function(a, b) { 
    var order = b.rating - a.rating; 

    if (order !== 0) {
      return order;
    }

  	return a.name.localeCompare(b.name); 
  });
};
