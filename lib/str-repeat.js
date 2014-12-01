// using utf-8 characters with the `return new Array(count).join()` trick fails
module.exports = function(chr, count) {
  var result = '';
  for (var i = Math.max(0, count); i > 0; i--) {
    result += chr;
  }
  return result;
};
