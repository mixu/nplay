#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    Meta = require('./lib/metadata.js');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync),
    isList = process.argv.indexOf('--ls') > -1,
    isMerge = process.argv.indexOf('--merge') > -1,
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    shouldReadConfig = (process.argv.length <= 2 || isList);

if (shouldReadConfig && !existsSync(homePath + '/.nplay.json')) {
  console.log('~/.nplay.json does not exist.');
  console.log('Please create "' + homePath + '/.nplay.json" with ' +
              'paths to your music directories, like this:');
  console.log('\techo \'{ "directories": [ "/home/m/mp3" ] }\' >> ~/.nplay.json');
  console.log('Alternatively, specify paths as arguments: nplay /home/m/mp3');
  process.exit();
}

var pi = require('pipe-iterators'),
    dirStream = require('./lib/dir-stream'),
    validExts = { '.mp3': true, '.wav': true, '.m4a': true },
    config = {},
    dirs;

if (shouldReadConfig) {
  config = require(homePath + '/.nplay.json');
}

if (isMerge) {
  var db = require(homePath + '/.nplay.db.json');
  // merge database content, then exit
  var otherFile = process.argv[process.argv.indexOf('--merge') + 1];
  if (!otherFile) {
    console.log('--merge target not set!');
    return;
  }
  otherFile = path.resolve(process.cwd, otherFile);
  var other = require(otherFile);
  Object.keys(other).forEach(function(key) {
    if (typeof db[key] !== 'object') {
      // console.log('Add entry', key, db[key], other[key]);
      db[key] = other[key];
    } else {
      // merge
      Object.keys(other[key]).forEach(function(subkey) {
        var target = (!isNaN(parseInt(db[key][subkey], 10)) ? parseInt(db[key][subkey], 10) : db[key][subkey]),
            source = (!isNaN(parseInt(other[key][subkey], 10)) ? parseInt(other[key][subkey], 10) : other[key][subkey]);

        if (target == source) {
          return; // skip
        }
        if (!isNaN(target) && !isNaN(source)) {
          if (source < target) {
            return; // skip
          }
          // for numeric keys, use max
          db[key][subkey] = source;
        } else {
          // all other keys: use the merge target value
          db[key][subkey] = source;
        }
      });
    }
  });

  console.log(JSON.stringify(db, null, 2));
  return;
}

// allow explicit override in the config file
if (!config.countChar && !config.starChar) {
  // when nothing is set, do a hybrid mode
  if (typeof config.utf === 'undefined') {
    // in OSX/Windows, the default font seems to
    // have the musical note char but the star char is messed up
    // in Linux, it seems the terminal fonts have decent UTF8 support
    config.countChar = '♫';
    config.starChar = (process.platform === 'linux' ? '★' : '*');
  } else if (config.utf) {
    config.countChar = '♫';
    config.starChar = '★';
  } else {
    config.countChar = '#';
    config.starChar = '*';
  }
}

dirs = (shouldReadConfig ?
            config.directories :
            process.argv.slice(2).filter(function(str) { return str != '--ls'; })
            );


var listen = require('./lib/listen.js'),
    Playlist = require('./lib/playlist.js');

Meta.read();

pi.fromArray(dirs)
  .pipe(pi.map(function(dir) {
    return path.resolve(homePath, dir);
  }))
  .pipe(dirStream()) // resolve to files { path: .., stat: .. }
  .pipe(pi.filter(function(file) { return validExts[path.extname(file.path)]; }))
  .pipe(pi.map(function(file) {
    // add rating property from metadata
    var name = path.basename(file.path, path.extname(file.path)),
        meta = Meta.get(name);
    file.name = name;
    file.rating = (meta && meta.rating ? meta.rating : 0);
    file.playCount = (meta && meta.playCount ? meta.playCount : 0);
    file.lastPlay = (meta && meta.lastPlay ? new Date(meta.lastPlay) : 0);
    return file;
  }))
  .pipe(pi.toArray(function(files) {
    if (isList) {
      files.forEach(function(file) {
        console.log(file.rating + ',' + file.path);
      });
      return;
    }

    var playlist = new Playlist(files);

    listen(playlist, config);

  }));
