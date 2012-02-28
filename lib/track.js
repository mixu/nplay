//var TagLib = require('taglib');
var Metadata = require('./metadata.js');

function Track(filename) {
  this.name = path.basename(filename, '.mp3');
  this.filename = filename.replace(' ', '\ ');

  var meta = Metadata.get(this.name);
  this.rating = (meta && meta.rating ? meta.rating : '0');
/*
  var tag = TagLib.tagSync(filename);
  this.title = tag.title;
  this.artist = tag.artist;
  this.album = tag.album;
*/
}

Track.prototype.rate = function(rating) {
  this.rating = rating
  Metadata.rate(this.name, this.rating);
  Metadata.write('./db.json');
};

module.exports = Track;
