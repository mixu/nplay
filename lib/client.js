var tty = require('tty');
    path = require('path'),
    child_process = require('child_process'),

    NodeCli = require('./node-cli.js'),
    cli = new NodeCli(),

    PathIterator = require('./path_iterator.js');

var client = {},
    current_proc = null,
    selected = 0,
    current_volume = 35,
    shuffle = false,
    repeat = false,
    playlist = [];

client.previous = function() {
  console.log('Previous');
  if(!repeat) {
    selected--;
  }
  client.play();
};
client.play = function(position) {
  client.stop();
  if(position) {
    selected = position;
  }
  selected = Math.max(0, Math.min(playlist.length-1, selected));
  console.log('mpg123 '+playlist[selected].filename);
  // '--gain', current_volume,
  current_proc = child_process.spawn('mpg123', [ '-q', '--long-tag',  playlist[selected].filename.replace(' ', '\ ') ]);
  current_proc.stdout.pipe(process.stdout);
  current_proc.stderr.pipe(process.stderr);
  current_proc.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if(code == 0) {
      client.next();
    }
  });
};

client.pause = client.stop = function() {
  current_proc && (current_proc.kill(), current_proc = null);
};

client.next = function() {
  console.log('Next');
  if(shuffle) {
    selected = Math.floor(Math.random()*playlist.length);
  } else if(!repeat) {
    selected++;
  }
  client.play();
};

client.shuffle = function() {
  shuffle = !shuffle;
  console.log('Set shuffle', shuffle);
};
client.repeat = function() {
  repeat = !repeat;
  console.log('Set repeat', repeat);
};
client.volume = function(volume) {
  current_volume = Math.max(0, Math.min(100, volume));
  client.play();
};

client.scan = function(directory) {
  var pi = new PathIterator();
  pi.on('file', function(filename, stats) {
    if(path.extname(filename) == '.mp3') {
      var item = {
        name: path.basename(filename, '.mp3'),
        filename: filename.replace(' ', '\ ')
      };
      playlist.push(item);
    }
  });
  pi.on('end', function() {
    playlist.sort(function(a, b) {
      return a.filename.localeCompare(b.filename);
    });
    // console.log('Scan complete.');
  });
  pi.iterate(directory, 100);
};


client.run = function() {
  var jump_mode = false;
  process.stdin.resume();
  tty.setRawMode(true);
  process.stdin.on('keypress', function (chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
      client.stop();
      process.exit();
      return;
    }
    if(jump_mode) {
      var track = autocomplete(chunk, key);
      if(track > -1) {
        client.play(track);
        jump_mode = false;
        cli.clear();
      } else if(track == -2) {
        jump_mode = false;
        cli.clear();
      }
    } else if(key) {
      switch(key.name) {
        case 'z':
          client.previous();
          break;
        case 'x':
          client.play();
          break;
        case 'c':
          client.pause();
          break;
        case 'v':
          client.stop();
          break;
        case 'b':
          client.next();
          break;
        case 's':
          client.shuffle();
          break;
        case 'r':
          client.repeat();
          break;
        case 'j':
          jump_mode = true;
          current = '';
          selected = 0;
          selected_index = -1;
          console.log('? ');
          break;
        case 'up':
          current_volume += 5;
          client.volume(current_volume);
          break;
        case 'down':
          current_volume -= 5;
          client.volume(current_volume);
          break;
        case 'h':
        case '?':
        default:
          console.log('Commands:');
          console.log("\tz - Previous");
          console.log("\tx - Play");
          console.log("\tc - Pause");
          console.log("\tv - Stop");
          console.log("\tn - Next");
          console.log("\ts - Shuffle");
          console.log("\tr - Repeat");
          console.log("\tj - Jump");
          console.log("\tup - Volume up");
          console.log("\tdown - Volume down");
          break;
      }
    }
  });
};

function autocomplete(chunk, key) {
  if(!key) {
    return -1;
  }
  console.log(key, selected, selected_index);
  if(key.name.length == 1) {
     current += key.name;
  } else {
    switch(key.name) {
      case 'escape':
        return -2;
      case 'enter':
        return selected_index;
      case 'down':
        selected++;
        break;
      case 'up':
       selected--;
        break;
      case 'space':
       current += ' ';
        break;
      case 'backspace':
       current = current.substr(0, current.length-1);
    }
  }
  console.log(selected);
  selected = Math.max(0, Math.min(playlist.length-1, selected));
  if(current == '') {
     selected_index = selected;
  }
  cli.clear()
     .up(1)
     .write("? "+current+"\n")
     .write("*********************************\n");

  var showed = 0;
  var search = current.split(" ").filter(function(element){return element.length > 0;});
  var matches = [];
  for(var i = 0; i < playlist.length; i++) {
     matches = [];
     for(var j = 0; j < search.length; j++) {
        var pos = playlist[i].name.toLowerCase().indexOf(search[j]);
        if( pos > -1) {
           matches.push(pos);
        } else {
          break;
        }
     }
     if(matches.length == search.length) {
        var from = 0;
        for(var j = 0; j < matches.length; j++) {
           cli.color('white', (showed == selected));
           cli.write(playlist[i].name.substring(from, matches[j]));
           from = matches[j];
           if(showed == selected) {
              selected_index = i;
              cli.color('red', true);
           } else {
              cli.color('yellow', false);
           }
           cli.write(playlist[i].name.substring(from, from+search[j].length));
           from += search[j].length;
        }
        cli.color('white', (showed == selected));
        cli.write(playlist[i].name.substring(from)+"\n");
        cli.color('white');
        showed++;
        if(showed == 5) {
           break;
        }
     } else {
        continue;
     }
  }
  return -1;
}


module.exports = client;
