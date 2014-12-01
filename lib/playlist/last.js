
module.exports = function(playlist) {
  return playlist.sort(function(a, b) {
    // if either song has no rating, then sort it lower (note: desc order!)
    if (!a.lastPlay && b.lastPlay) {
      return 1;
    }
    if (!b.lastPlay && a.lastPlay) {
      return -1;
    }
    var order = 0;

    if (typeof a.lastPlay.getTime === 'function' &&
        typeof b.lastPlay.getTime === 'function') {
      order = b.lastPlay.getTime() - a.lastPlay.getTime();
    }

    if (order !== 0) {
      return order;
    }
    // alpha sort as last resort
    return a.name.localeCompare(b.name);
  });
};
