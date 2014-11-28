module.exports = function(playlist) {
  // Apply fisher-yates
  var tmp, current, top = playlist.length;

  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = playlist[current];
    playlist[current] = playlist[top];
    playlist[top] = tmp;
  }

  return playlist;
};
