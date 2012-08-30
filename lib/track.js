var path = require('path'),
    Metadata = require('./metadata.js');

var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function Track(filename) {
  this.name = path.basename(filename, '.mp3');
  this.filename = filename.replace(' ', '\ ');

  var meta = Metadata.get(this.name);
  this.rating = (meta && meta.rating ? meta.rating : '0');
}

Track.prototype.rate = function(rating) {
  this.rating = rating
  Metadata.rate(this.name, this.rating);
  Metadata.write(homePath+'/.nplay.db.json');
};

module.exports = Track;
