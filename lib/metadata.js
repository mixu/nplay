var fs = require('fs'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function Metadata() {
  this.items = {};
}

Metadata.read = function() {
  try {
    this.items = JSON.parse(fs.readFileSync(homePath + '/.nplay.db.json').toString());
  } catch(e) {
    this.items = {};
  }
};

Metadata.write = function() {
  fs.writeFileSync(homePath + '/.nplay.db.json', JSON.stringify(this.items, null, 2));
};

Metadata.rate = function(song, rating) {
  this.items[song.name] || (this.items[song.name] = { });
  this.items[song.name].rating = rating;
  song.rating = rating;
};

Metadata.incrementPlays = function(song) {
  this.items[song.name] || (this.items[song.name] = { });
  if (typeof this.items[song.name].playCount === 'number') {
    this.items[song.name].playCount++;
  } else {
    this.items[song.name].playCount = 1;
  }
  song.playCount = this.items[song.name].playCount;
};

Metadata.get = function(filename) {
  return this.items[filename];
};

module.exports = Metadata;
