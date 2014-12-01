var path = require('path'),
    chalk = require('chalk'),
    uRepeat = require('../str-repeat');

function highlight(str, tokens, isCurrent) {
  function identity(str) { return str; }
  // tokens in bold red on the selected song, yellow on the rest
  var tokenColorFn = chalk.yellow,
      // base color is white for the selected song, no-color on the rest
      baseColorFn = identity,
      lowerCased = str.toLowerCase();

  // gjslint is stupid when it comes to ternaries for function assignment
  if (isCurrent) {
    tokenColorFn = chalk.red.bold;
    baseColorFn = chalk.white.bold;
  }

  var highlightRanges = [];

  for (var i = 0; i < tokens.length; i++) {
    var pos = lowerCased.indexOf(tokens[i]);
    if (pos > -1) {
      highlightRanges.push({ start: pos, end: pos + tokens[i].length });
    }
  }

  // nothing to highlight
  if (highlightRanges.length === 0) {
    return baseColorFn(str);
  }
  highlightRanges = highlightRanges.sort(function(a, b) {
    return a.start - b.start;
  });

  var result = '';
  var prevEnd = 0;
  highlightRanges.forEach(function(range) {
    result += baseColorFn(str.slice(prevEnd, range.start));
    result += tokenColorFn(str.slice(range.start, range.end));
    prevEnd = range.end;
  });
  if (prevEnd < str.length) {
    result += baseColorFn(str.slice(prevEnd));
  }

  return result;
}

module.exports = function(tracks, currentTrack, line, maxCols, useUtf8) {
  var filenames = [],
      playCounts = [],
      ratings = [],
      tokens = line.split(' ').filter(Boolean);

  maxCols--; // margin of one character

  function maxLength() {
    return tracks.reduce(function(acc, current, i) {
      return Math.max(acc, chalk.stripColor(filenames[i] + playCounts[i] + ratings[i]).length);
    }, 0);
  }

  tracks.forEach(function(track) {
    filenames.push(path.basename(track.path, path.extname(track.path)));
    playCounts.push(track.playCount || 0);
    ratings.push(track.rating || 0);
  });

  var countChar = (useUtf8 ? '♫ ' : '#'),
      starChar = (useUtf8 ? '★' : '*');

  playCounts = playCounts.map(function(count) {
    return ' ' + chalk.white.bold(countChar) + ' ' + count;
  });
  ratings = ratings.map(function(stars) {
    return ' ' + uRepeat(' ', 5 - stars) + chalk.yellow(uRepeat(starChar, stars));
  });

  if (maxLength() > maxCols) {
    playCounts = playCounts.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    ratings = ratings.map(function() { return ''; });
  }

  if (maxLength() > maxCols) {
    filenames = filenames.map(function(filename, i) {
      var length = chalk.stripColor(playCounts[i] + ratings[i]).length;
      return filename.substr(0, maxCols - length);
    });
  }

  var rows = tracks.map(function(track, i) {
    var length = chalk.stripColor(filenames[i] + playCounts[i] + ratings[i]).length;
    // highlight matching extents
    return highlight(filenames[i], tokens, (track === currentTrack)) +
           uRepeat(' ', maxCols - length) + playCounts[i] + ratings[i];
  });

  return rows;
};
