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

Metadata.rate = function(filename, rating) {
  this.items[filename] || (this.items[filename] = {});
  this.items[filename].rating = rating;
};

Metadata.get = function(filename) {
  return this.items[filename];
};

module.exports = Metadata;
