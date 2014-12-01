var topSort = require('../top-sort');

module.exports = function(playlist) {
  return playlist.sort(topSort);
};
