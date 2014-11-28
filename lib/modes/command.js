var playSong = require('../play-song.js'),
    repeatPlaylist = require('../playlist/repeat'),
    shufflePlaylist = require('../playlist/shuffle'),
    filterPlaylist = require('../playlist/filter');

var path = require('path'),
    chalk = require('chalk'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    Meta = require('../metadata.js');

module.exports = function(opts) {

  var playlist = opts.playlist,
      shuffle = false,
      repeat = false,
      filter = false;

  function applyFilters() {
    if (repeat) {
      playlist.mode(repeatPlaylist);
      list(playlist.current());
      return;
    }
    var modes = [
      filter ? filterPlaylist : false,
      shuffle ? shufflePlaylist : false
    ].filter(Boolean);
    if (modes.length > 0) {
      playlist.mode.apply(playlist, modes);
    } else {
      // play all playlist
      playlist.mode(function(playlist) { return playlist; });
    }
    list(playlist.current());
  }
  function status() {
    return (shuffle ? '[Shuffle] ' : '') +
           (filter ? '[Filter] ' : '') +
           (repeat ? '[Repeat] ' : '');
  }

  function strRepeat(chr, count) {
    return new Array(Math.max(0, count) + 1).join(chr);
  }
  function uRepeat(chr, count) {
    var result = '';
    for (var i = Math.max(0, count); i > 0; i--) {
      result += chr;
    }
    return result;
  }

  // Must set iterm font to Menlo (from Monaco) or some other font that renders
  // utf-8 characters as normal-width characters (rather than double width, which looks terrible!)
  var useUtf8 = true;


  function list(currentSong) {
    // build columnar array
    var list = playlist.context(process.stdout.rows - 1),
        rows = list.map(function(song) {
      var dirname = path.dirname(song.path).replace(homePath, '~') + path.sep,
          filename = path.basename(song.path, path.extname(song.path));
      return [ dirname, filename, (song.playCount || 0), (song.rating || 0)];
    });

    if (rows.some(function(row) { return row.join('').length > process.stdout.columns; })) {
      // drop the dirname
      rows = rows.map(function(row) { return row.slice(1); });
    }

    console.log(rows.map(function(row, index) {
      var song = list[index];
      var i = 0;
      var rowLength = process.stdout.columns - row.slice(0, -2).join('').length; // before colors
      // dirname
      if (row.length >= 4) {
        row[i] = chalk.gray.dim(row[i]);
        i++;
      }
      // filename
      row[i] = (song !== currentSong ? chalk.white(row[i]) : chalk.yellow(row[i]));

      // padding
      var padding;
      if (useUtf8) {
        // 5 = stars, 4 = play count
        padding = Math.max(0, rowLength - 5 - 4);
      } else {
        // 3 = [n], 3 = play count
        padding = Math.max(0, rowLength - 3 - 3);
      }
      row[i] += strRepeat(' ', padding);
      i++;


      // play count
      rowLength += 2;
      if (useUtf8) {
        row[i] = '♫ ' + row[i] + ' ';
      } else {
        row[i] = row[i] + 'x ';
      }
      if (song === currentSong) {
        row[i] = chalk.yellow(row[i]);
      }
      i++;

      // rating
      if (useUtf8) {
        row[i] = strRepeat(' ', 5 - row[i]) + uRepeat('★', row[i]);
      } else {
        row[i] = strRepeat(' ', padding) +
                chalk.gray.dim('[') +
                row[i] +
                chalk.gray.dim(']');
      }
      if (song === currentSong) {
        row[i] = chalk.yellow(row[i]);
      }


      if (song === currentSong) {
        return row.join('');
        // + ' Played: ' +  + 'x, last played ?? days ago';
      }
      return row.join('');
    }).join('\n'));
  }

  function exitFn(err, song, wasKilled) {
    if (!wasKilled && !err) {
      Meta.incrementPlays(song);
      Meta.write();
      dispatch.b();
    }
  }

  function playCurrent() {
    list(playlist.current());
    console.log(status());
    playSong(playlist.current(), exitFn);
  }

  var dispatch = {
    z: function() {
      list(playlist.prev());
      console.log(status());
      playSong(playlist.current(), exitFn);
    },
    x: playCurrent,
    enter: playCurrent,
    c: function() { playSong(); },
    v: function() { playSong(); },
    b: function() {
      list(playlist.next());
      console.log(status());
      playSong(playlist.current(), exitFn);
    },
    s: function() {
      shuffle = !shuffle;
      console.log('Set shuffle', shuffle);
      if (shuffle && filter) {
        console.log('Set filter and shuffle mode true');
      }
      applyFilters();
    },
    r: function() {
      repeat = !repeat;
      console.log('Set repeat', repeat);
      applyFilters();
    },
    f: function() {
      filter = !filter;
      console.log('Set filter', filter);
      if (shuffle && filter) {
        console.log('Set filter and shuffle mode true');
      }
      applyFilters();
    },
    up: function() {
      list(playlist.prev());
    },
    down: function() {
      list(playlist.next());
    },
    pageup: function() {
      for (var i = Math.floor(process.stdout.rows / 2) - 2; i > 0; i--) {
        playlist.prev();
      }
      list(playlist.current());
    },
    pagedown: function() {
      for (var i = Math.floor(process.stdout.rows / 2) - 2; i > 0; i--) {
        playlist.next();
      }
      list(playlist.current());
    },
    home: function() {
      playlist.jump(0);
      list(playlist.current());
    },
    end: function() {
      playlist.jump(Infinity);
      list(playlist.current());
    }
  };

  return function(ch, key) {
    if (['1', '2', '3', '4', '5'].indexOf(ch) > -1) {
      console.log('Rate ', ch);
      Meta.rate(playlist.current(), ch);
      Meta.write();
      list(playlist.current());
      return true;
    }

    if (!key || !key.name) {
      return false;
    }

    if (dispatch[key.name]) {
      dispatch[key.name]();
      return true;
    }
    return false;
  };
};
