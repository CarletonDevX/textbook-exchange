var port = 1337;

var express = require('express'),
    routes = require('./app/routes/routes');

var app = express();

// Static file location
app.use(express.static(__dirname + '/public'));

// Views location and engine
app.set('views', './app/views');
app.set('view engine', 'jade');

// Set up routing
routes.setup(app);

// Start!
app.listen(port);

// Used for testing
module.exports = app;

console.log('Server running at http://localhost:' + port);