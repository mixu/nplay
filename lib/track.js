var TagLib = require('taglib');


function Track(filename) {
  this.name = path.basename(filename, '.mp3');
  this.filename = filename.replace(' ', '\ ');

  var tag = TagLib.tagSync(filename);
  this.title = tag.title;
  this.artist = tag.artist;
  this.album = tag.album;

}

module.exports = Track;
