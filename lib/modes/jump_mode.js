

function LineReader() {
  this.line = '';
}

LineReader.keypress = function(chunk, key) {
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
  return this.line;
};

function JumpMode() { }

JumpMode.selected = 0;
JumpMode.isComplete = false;

JumpMode.keypress = function(chunk, key)
  if(!key) {
    return -1;
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

  var items = Playlist.search(LineReader.keypress(chunk, key));

  items.forEach(function display(item) {
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
  });
  return -1;
}


