#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    player = require('./lib/player.js');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

if(process.argv.length > 2) {
  var args = process.argv.slice(0);
  // shift off node and script name
  args.shift(); args.shift();
  console.log('Adding paths: ', args);
  args.forEach(function(dir) { player.scan(dir); });
} else {
  if(!existsSync(homePath+'/.nplay.json')) {
    console.log('~/.nplay.json does not exist.');
    console.log('Please create "'+homePath+'/.nplay.json" with paths to your music directories, like this:');
    console.log('\techo \'{ "directories": [ "/home/m/mp3" ] }\' >> ~/.nplay.json');
    console.log('Alternatively, specify paths as arguments: nplay /home/m/mp3');
    process.exit();
  } else {
    require(homePath+'/.nplay.json').directories.forEach(function(dir) {
      player.scan(dir);
    });
  }
}

player.run();
