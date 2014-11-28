var playSong = require('../play-song.js'),
    repeatPlaylist = require('../playlist/repeat'),
    shufflePlaylist = require('../playlist/shuffle'),
    filterPlaylist = require('../playlist/filter');

var path = require('path'),
    chalk = require('chalk'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

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

  function list(currentSong) {
    console.log(playlist.context(process.stdout.rows).map(function(song) {
      var dirname = path.dirname(song.path).replace(homePath, '~') + path.sep,
          filename = path.basename(song.path, path.extname(song.path));
      if (song !== currentSong) {
        return chalk.gray.dim(dirname) + chalk.white(filename) +
               chalk.gray.dim(' [') + (song.rating || '0') + chalk.gray.dim(']');
      }
        return chalk.gray.dim(dirname) + chalk.yellow(filename) +
               chalk.gray.dim(' [') + (song.rating || '0') + chalk.gray.dim(']');
    }).join('\n'));
  }

  var dispatch = {
    z: function() {
      list(playlist.prev());
      playSong(status(), playlist.current(), function(err) { if (!err) { dispatch.b(); } });
    },
    x: function() {
      list(playlist.current());
      playSong(status(), playlist.current(), function(err) { if (!err) { dispatch.b(); } });
    },
    c: function() { playSong(); },
    v: function() { playSong(); },
    b: function() {

      list(playlist.next());


      playSong(status(), playlist.current(), function(err) { if (!err) { dispatch.b(); } });
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
    }
  };

  return function(ch, key) {
    if (!key || !key.name) {
      return false;
    }

    if (dispatch[key.name]) {
      dispatch[key.name]();
      return true;
    }

// Handle rating
// if(['1', '2', '3', '4', '5'].indexOf(chunk) > -1) {
//       console.log('Rate ', chunk);
//       playlist.songs[playlist.current].rate(chunk);
//
//   Metadata.rate(this.name, this.rating);
//   Metadata.write(homePath+'/.nplay.db.json');
//       console.log(playlist.songs[playlist.current].name, '[' + (playlist.songs[playlist.current].rating || '0') + ']');



    return false;
  };
};
