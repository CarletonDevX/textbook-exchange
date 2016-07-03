// Everything starts here....
// Uses nodemon to automatically restart on file changes.

var nodemon = require('nodemon');

nodemon({
  script: 'server.js',
  ext: '*'
});

// this is so we don't have to press ctrl-c twice to shut down
process.on('SIGINT', function () {
  process.exit();
});

nodemon.on('restart', function (files) {
  console.log('Change detected, restarting:', files.join(', '));
});