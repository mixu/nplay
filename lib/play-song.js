var path = require('path'),
    child_process = require('child_process'),
    chalk = require('chalk'),
    homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
// plays a song - at most one song at a time
// song is a file-like object, e.g:
// {
//   path: fullpath
//   rating: 1 .. 5,
//   playCount: nn,
//    ...
// }

var player = null;

module.exports = function(status, song, onDone) {
  // stop existing playback
  if (player) {
    player.kill();
    player = null;
  }
  if (!song) { return; }

  // Krewella - Killin' It (Mutrix Remix) [5]
  // Played: 5x, last played 2 days ago

  console.log(status);


  // on OSX, use afplay
  var args;
  if (process.platform == 'darwin') {
    args = ['afplay', [ '-q', '1', song.path.replace(' ', '\ ') ]];

  } else if(process.platform == 'win32') {
    args = [ path.normalize(__dirname + path.sep + '..' + path.sep + 'mplayer.exe'),
      [ '-really-quiet', '-nolirc', '-nofontconfig', song.path.replace(' ', '\ ')  ]];
  } else {
    args = ['mplayer', [ '-really-quiet', '-nolirc', song.path.replace(' ', '\ ') ]];
  }
  // console.log(args);
  player = child_process.spawn.apply(child_process, args);
  player.stdout.pipe(process.stdout);
  player.stderr.pipe(process.stderr);

  player.once('exit', function (code) {
    onDone(code != 0 ? new Error('Child process exited with code ' + code) : null);
  });

};
