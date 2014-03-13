#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    List = require('minitask').list,
    Meta = require('./lib/metadata.js'),
    player = require('./lib/player.js');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

var list = new List();

var isList = process.argv.indexOf('--ls') > -1;

if(process.argv.length > 2 && !isList) {
  var args = process.argv.slice(0);
  // shift off node and script name
  args.shift(); args.shift();
  args.forEach(function(dir) {
    var fulldir = path.resolve(homePath, dir);
    if(fs.existsSync(fulldir)) {
      if(!isList) {
        console.log('Adding path: ', fulldir);
      }
      list.add(fulldir);
    }
  });
} else {
  if(!existsSync(homePath+'/.nplay.json')) {
    console.log('~/.nplay.json does not exist.');
    console.log('Please create "'+homePath+'/.nplay.json" with paths to your music directories, like this:');
    console.log('\techo \'{ "directories": [ "/home/m/mp3" ] }\' >> ~/.nplay.json');
    console.log('Alternatively, specify paths as arguments: nplay /home/m/mp3');
    process.exit();
  } else {
    require(homePath+'/.nplay.json').directories.forEach(function(dir) {
      list.add(path.resolve(homePath, dir));
    });
  }
}

list.exec(function(err, files) {
  if (isList) {
    Meta.read(homePath+'/.nplay.db.json');
    files.map(function(file) {
      var basename = path.basename(file.name, '.mp3'),
          meta = Meta.get(basename),
          rating = (meta && meta.rating ? meta.rating : 0);

      if(file.stat.isFile()) {
        console.log(rating + ',' + file.name);
      }
    })
    return;
  }
  player.run(files);
});
