var client;

function CommandMode() {

}

CommandMode.setClient = function(obj) {
  client = obj;
}

CommandMode.keypress = function(chunk, key) {
  if(!key) {
    return;
  }
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
};

module.exports = CommandMode;
