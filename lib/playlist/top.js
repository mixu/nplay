module.exports = function(playlist) {
  return playlist.sort(function(a, b) { return a.rating - b.rating; });
};
