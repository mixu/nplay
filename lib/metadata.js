var fs = require('fs');

function Metadata() {
  this.items = {};
}

Metadata.read = function(jsonFile) {
  try {
    this.items = JSON.parse(fs.readFileSync(jsonFile));
  } catch(e) {
    this.items = {};
  }
};

Metadata.write = function(jsonFile) {
  fs.writeFileSync(jsonFile, JSON.stringify(this.items, null, 2));
};

Metadata.rate = function(filename, rating) {
  this.items[filename] || (this.items[filename] = {});
  this.items[filename].rating = rating;
};

Metadata.get = function(filename) {
  return this.items[filename];
};

module.exports = Metadata;
