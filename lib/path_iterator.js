var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var PathIterator = function() { };

// augment the prototype using util.inherits
util.inherits(PathIterator, EventEmitter);

PathIterator.prototype.iterate = function(path, maxDepth, currDepth) {
   var self = this;
   currDepth = (currDepth == undefined ? 0 : currDepth);
   maxDepth = (maxDepth == undefined ? -1 : maxDepth);   
   var seenDeeper = false;
   fs.readdir(path, function iterateFile(err, files) {
      if(err) { return callback(err); }
      var counter = files.length;
      files.forEach(function(file, index) {
         // perform a fs.stat to determine whether this is a directory
         fs.stat(path+'/'+file, function statFile(err, stats) {              
            if(err) { 
               self.emit('error', err);
            }
            if(stats.isFile() && self.listeners('file').length > 0) {
               self.emit('file', path+'/'+file, stats);
            } else if(stats.isDirectory()) {
               self.emit('directory', path+'/'+file, stats);
               if(maxDepth < 0 || currDepth < maxDepth) {
                  seenDeeper = true;
                  self.iterate(path+'/'+file, maxDepth, currDepth+1);
               } 
            }
            counter--;
            if(!seenDeeper && counter == 0) {               
               self.emit('end');
            }
         });            
      });
   });
};

module.exports = PathIterator;
