// called when repeat is set with the master playlist (current song at top)
// returns the new playlist

module.exports = function(playlist, current) {
  return [ current ];
};
