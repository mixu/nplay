module.exports = function(a, b) {
  // if either song has no rating, then sort it lower (note: desc order!)
  if (a.rating === 0 && b.rating > 0) {
    return 1;
  }
  if (b.rating === 0 && a.rating > 0) {
    return -1;
  }

  // sort by plays, then by ratings
  var order = b.playCount - a.playCount;

  if (order !== 0) {
    return order;
  }

  order = b.rating - a.rating;

  if (order !== 0) {
    return order;
  }
  // alpha sort as last resort
  return a.name.localeCompare(b.name);
}
