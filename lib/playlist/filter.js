module.exports = function(playlist) {
  return playlist.filter(function(song) {
    return song.rating >= 3;
  });
};
