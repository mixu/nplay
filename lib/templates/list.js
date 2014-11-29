var path = require('path'),
    chalk = require('chalk'),
    timeago = require('timeago'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function status() {
  return (shuffle ? '[Shuffle] ' : '') +
         (filter ? '[Filter] ' : '') +
         (repeat ? '[Repeat] ' : '');
}

// using utf-8 characters in [].join() fails
function uRepeat(chr, count) {
  var result = '';
  for (var i = Math.max(0, count); i > 0; i--) {
    result += chr;
  }
  return result;
}

// Must set iterm font to Menlo (from Monaco) or some other font that renders
// utf-8 characters as normal-width characters (rather than double width, which looks terrible!)

module.exports = function(songs, currentSong, maxCols, useUtf8) {
  var dirnames = [],
      filenames = [],
      padding = [],
      lastPlayed = []
      playCounts = [],
      ratings = [];

  maxCols--; // margin of one character

  function maxLength() {
    return songs.reduce(function(acc, current, i) {
      return Math.max(acc, chalk.stripColor(dirnames[i] + filenames[i] + lastPlayed[i] + playCounts[i] + ratings[i]).length);
    }, 0);
  }

  songs.forEach(function(song) {
    dirnames.push(path.dirname(song.path).replace(homePath, '~') + path.sep);
    filenames.push(path.basename(song.path, path.extname(song.path)));
    lastPlayed.push((song.lastPlay !==0 ? ' > ' + timeago(song.lastPlay) : ''));
    playCounts.push(song.playCount || 0);
    ratings.push(song.rating || 0);
  });

  if (useUtf8) {
    playCounts = playCounts.map(function(count) { return ' ♫ ' + count; });
    ratings = ratings.map(function(stars) { return ' ' + uRepeat(' ', 5 - stars) + uRepeat('★', stars); });
  } else {
    playCounts = playCounts.map(function(count) { return ' ' + count + 'x'; });
    ratings = ratings.map(function(stars) { return chalk.gray.dim('[') + stars + chalk.gray.dim(']'); });
  }

  if (maxLength() > maxCols) {
    lastPlayed = lastPlayed.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    dirnames = dirnames.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    playCounts = playCounts.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    ratings = ratings.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    filenames = filenames.map(function(filename, i) {
      var length = dirnames[i].length + lastPlayed[i].length + playCounts[i].length + ratings[i].length;
      return filename.substr(0, maxCols - length);
    });
  }

  var rows = songs.map(function(song, i) {
    var length = dirnames[i].length + filenames[i].length + lastPlayed[i].length + playCounts[i].length + ratings[i].length;

    var rest = filenames[i] + uRepeat(' ', maxCols - length) + lastPlayed[i] + playCounts[i] + ratings[i];

    return dirnames[i] + (song === currentSong ? chalk.yellow(rest) : rest);
  });
        // + ' Played: ' +  + 'x, last played ?? days ago';

  return rows;

};
