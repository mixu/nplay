function Track(filename) {
  this.name = path.basename(filename, '.mp3');
  this.filename = filename.replace(' ', '\ ');
}
