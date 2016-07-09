// Everything starts here....
// Uses nodemon to automatically restart on file changes.

var nodemon = require('nodemon');

nodemon({
  script: 'server.js',
  ext: '*',	
  watch: [
  	'public/scripts/main.js'
  ]
});

// this is so we don't have to press ctrl-c twice to shut down
process.on('SIGINT', function () {
  process.exit();
});

nodemon.on('restart', function (files) {
  var files = files || [];
  console.log('Change detected, restarting:', files.join(', '));
});