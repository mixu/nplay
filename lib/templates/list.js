var path = require('path'),
    chalk = require('chalk'),
    timeago = require('timeago'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    uRepeat = require('../str-repeat');

module.exports = function(opts) {
  var songs = opts.tracks,
      currentSong = opts.current,
      maxCols = opts.maxCols;

  var dirnames = [],
      filenames = [],
      lastPlayed = [],
      playCounts = [],
      ratings = [];

  maxCols--; // margin of one character

  function maxLength() {
    return songs.reduce(function(acc, current, i) {
      return Math.max(acc,
        chalk.stripColor(
          dirnames[i] + filenames[i] + lastPlayed[i] +
          playCounts[i] + ratings[i]).length
        );
    }, 0);
  }

  songs.forEach(function(song) {
    dirnames.push(chalk.gray.dim(path.dirname(song.path).replace(homePath, '~') + path.sep));
    filenames.push(path.basename(song.path, path.extname(song.path)));
    lastPlayed.push((song.lastPlay !== 0 ? ' > ' + timeago(song.lastPlay) : ''));
    playCounts.push(song.playCount || 0);
    ratings.push(song.rating || 0);
  });

  playCounts = playCounts.map(function(count) {
    return ' ' + chalk.white.bold(opts.countChar) + ' ' + count;
  });
  ratings = ratings.map(function(stars) {
    return ' ' + uRepeat(' ', 5 - stars) + chalk.yellow(uRepeat(opts.starChar, stars));
  });

  if (maxLength() > maxCols) {
    lastPlayed = lastPlayed.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    dirnames = dirnames.map(function() { return ''; });
  }

  if (maxCols < 60 && maxLength() > maxCols) {
    ratings = songs.map(function(song) {
      return ' ' + chalk.yellow.bold(opts.starChar) + song.rating || 0;
    });
  }

  if (maxLength() > maxCols) {
    filenames = filenames.map(function(filename, i) {
      var length = chalk.stripColor(dirnames[i] + lastPlayed[i] + playCounts[i] + ratings[i]).length;
      return filename.substr(0, maxCols - length);
    });
  }

  var rows = songs.map(function(song, i) {
    var length = chalk.stripColor(
      dirnames[i] + filenames[i] + lastPlayed[i] + playCounts[i] + ratings[i]
      ).length;

    return dirnames[i] +
          (song === currentSong ? chalk.yellow(filenames[i]) : filenames[i]) +
          uRepeat(' ', maxCols - length) + lastPlayed[i] + playCounts[i] + ratings[i];
  });

  return rows;
};
