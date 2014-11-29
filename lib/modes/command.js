var playSong = require('../play-song.js'),
    repeatPlaylist = require('../playlist/repeat'),
    shufflePlaylist = require('../playlist/shuffle'),
    filterPlaylist = require('../playlist/filter'),
    topPlaylist = require('../playlist/top'),
    list = require('../templates/list');

var path = require('path'),
    Meta = require('../metadata.js');

var clear = '\033[2J',
    up = function(n) { return '\033[' + n + 'A' };

var utf8 = true;

function CommandMode(opts) {
  var playlist = opts.playlist,
      shuffle = false,
      repeat = false,
      filter = false,
      top = false;

  function applyFilters() {
    if (top) {
      playlist.mode(topPlaylist);
      redraw();
      return;
    }
    if (repeat) {
      playlist.mode(repeatPlaylist);
      redraw();
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
    redraw();
  }

  function redraw() {
    var rows = list(playlist.context(process.stdout.rows - 1), playlist.current(), process.stdout.columns, utf8);
    process.stdout.write(clear);
    process.stdout.write(up(rows.length));
    process.stdout.write(rows.join('\n') + '\n');
  }

  function exitFn(err, song, wasKilled) {
    if (!wasKilled && !err) {
      dispatch.b();
    }
  }

  function playCurrent() {
    redraw();
    playSong(playlist.current(), exitFn);
  }

  var dispatch = {
    z: function() {
      playlist.prev();
      redraw();
      playSong(playlist.current(), exitFn);
    },
    x: playCurrent,
    enter: playCurrent,
    c: function() { playSong(); },
    v: function() { playSong(); },
    b: function() {
      playlist.next();
      redraw();
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
    u: function() {
      utf8 = !utf8;
      redraw();
    },
    t: function() {
      top = !top;
      console.log('Set top', top);
      applyFilters();
    },
    up: function() {
      playlist.prev();
      redraw();
    },
    down: function() {
      playlist.next();
      redraw();
    },
    pageup: function() {
      for (var i = Math.floor(process.stdout.rows / 2) - 2; i > 0; i--) {
        playlist.prev();
      }
      redraw();
    },
    pagedown: function() {
      for (var i = Math.floor(process.stdout.rows / 2) - 2; i > 0; i--) {
        playlist.next();
      }
      redraw();
    },
    home: function() {
      playlist.jump(0);
      redraw();
    },
    end: function() {
      playlist.jump(Infinity);
      redraw();
    }
  };

  this.keypress = function(ch, key) {
    if (['1', '2', '3', '4', '5'].indexOf(ch) > -1) {
      console.log('Rate ', ch);
      Meta.rate(playlist.current(), ch);
      Meta.write();
      redraw();
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

  this.redraw = redraw;
}

module.exports = CommandMode
