#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    Meta = require('./lib/metadata.js');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync),
    isList = process.argv.indexOf('--ls') > -1,
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
    dirs = (shouldReadConfig ?
            require(homePath + '/.nplay.json').directories :
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


    listen(playlist);

  }));
