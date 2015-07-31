var playSong = require('../play-song.js'),
    repeatPlaylist = require('../playlist/repeat'),
    shufflePlaylist = require('../playlist/shuffle'),
    filterPlaylist = require('../playlist/filter'),
    filterSortPlaylist = require('../playlist/filter-sort'),
    topPlaylist = require('../playlist/top'),
    lastPlaylist = require('../playlist/last'),
    list = require('../templates/list');

var path = require('path'),
    xtend = require('xtend'),
    chalk = require('chalk'),
    Meta = require('../metadata.js');

var clear = '\033[2J',
    up = function(n) { return '\033[' + n + 'A'; };

function CommandMode(opts) {
  var playlist = opts.playlist,
      utf = false,
      shuffle, repeat, filter, filterAndSort, top, last;

  function status() {
    return chalk.gray.dim([
      (shuffle ? '[Shuffle]' : ''),
      (repeat ? '[Repeat]' : ''),
      (filter ? '[Filter (rating >= 3)' + (filterAndSort ? ' and sort' : '') + ']' : ''),
      (top ? '[Sort by top]' : ''),
      (last ? '[Sort by last played]' : '')
    ].filter(Boolean).join(' '));
  }

  function applyFilters() {
    if (top) {
      if (filter) {
        playlist.mode(filterPlaylist, topPlaylist);
      } else {
        playlist.mode(topPlaylist);
      }
      playlist.jump(0);
      redraw();
      return;
    }
    if (last) {
      playlist.mode(lastPlaylist);
      playlist.jump(0);
      redraw();
      return;
    }
    if (repeat) {
      playlist.mode(repeatPlaylist);
      redraw();
      return;
    }
    var modes = [
      filter ? (filterAndSort ? filterSortPlaylist : filterPlaylist) : false,
      shuffle ? shufflePlaylist : false
    ].filter(Boolean);
    if (modes.length > 0) {
      playlist.mode.apply(playlist, modes);
    } else {
      playlist.reset();
    }
    redraw();
  }

  var lastClear = 0,
      playingSong = 0;

  function redraw(forceClear) {
    var rows = list(xtend({
        tracks: playlist.context(process.stdout.rows - 1),
        current: playlist.current(),
        maxCols: process.stdout.columns
      }, opts.config));
    // throttle clear operation to only occur every 500 ms to avoid excessive flicker
    // while also avoiding stray characters by occasionally clearing the screen
    if (forceClear || lastClear < new Date().getTime() - 500) {
      process.stdout.write(clear);
      lastClear = new Date().getTime();
    }
    process.stdout.write('\n'); // reset line
    process.stdout.write(up(rows.length));
    process.stdout.write(rows.join('\n') + '\n');
    process.stdout.write(status());
  }

  function exitFn(err, song, wasKilled) {
    if (!wasKilled && !err) {
      dispatch.b();
    }
  }

  function playCurrent() {
    redraw();
    playSong(playlist.current(), exitFn);
    playingSong = playlist.current();
  }

  var dispatch = {
    z: function() {
      playlist.prev();
      redraw();
      playSong(playlist.current(), exitFn);
      playingSong = playlist.current();
    },
    x: playCurrent,
    enter: playCurrent,
    escape: function() {
      playlist.jump(playingSong);
      redraw();
    },
    c: function() { playSong(); },
    v: function() { playSong(); },
    b: function() {
      playlist.next();
      redraw();
      playSong(playlist.current(), exitFn);
      playingSong = playlist.current();
    },
    s: function() {
      shuffle = !shuffle;
      console.log('Set shuffle', shuffle);
      if (shuffle) {
        // shuffle + filter is OK
        last = top = repeat = filterAndSort = false;
      }
      if (shuffle && filter) {
        console.log('Set filter and shuffle mode true');
      }
      applyFilters();
    },
    r: function() {
      repeat = !repeat;
      console.log('Set repeat', repeat);
      if (repeat) {
        shuffle = filter = filterAndSort = top = last = false;
      }
      applyFilters();
    },
    f: function() {
      if (!filter && !filterAndSort) {
        // 1st press: filter
        filter = true;
      } else if (filter && !filterAndSort) {
        // 2nd press: filter and sort
        filterAndSort = true;
      } else {
        // 3rd press: disable both
        filter = false;
        filterAndSort = false;
      }
      console.log('Set filter', filter, ', sort?', filterAndSort);
      if (shuffle && filter) {
        console.log('Set filter and shuffle mode true');
      }
      applyFilters();
    },
    u: function() {
      utf = !utf;
      if (utf) {
        opts.config.countChar = '♫';
        opts.config.starChar = '★';
      } else {
        opts.config.countChar = '#';
        opts.config.starChar = '*';
      }
      redraw();
    },
    t: function() {
      top = !top;
      console.log('Set top', top);
      if (top) {
        // reset others
        shuffle = filter = filterAndSort = repeat = last = false;
      }
      applyFilters();
    },
    l: function() {
      last = !last;
      console.log('Set last', last);
      if (last) {
        // reset others
        shuffle = filter = filterAndSort = top = repeat = false;
      }
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

  this.reset = function() {
    shuffle = false;
    repeat = false;
    filter = false;
    filterAndSort = false;
    top = false;
    last = false;
  };

  this.redraw = redraw;

  this.reset();
}

module.exports = CommandMode;
