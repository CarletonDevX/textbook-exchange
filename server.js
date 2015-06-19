process.env.NODE_ENV = 'development';
var config = require('./app/config/config');

// Set up db
var mongoose = require('mongoose'),
	model = require('./app/model');

db = mongoose.connect(config.db);

// Set up app
var express = require('express'),
    bodyParser = require('body-parser'),
	errorHandlers = require('./app/errors'),
	routes = require('./app/routes');

var app = express();

// Static file location
app.use(express.static(__dirname + '/public'));

// Views location and engine
app.set('views', './app/views');
app.set('view engine', 'jade');


/* REQUESTS */

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var logAll = function (req, res, next) {
	console.log(req.method, req.url);
	next();
};

app.use(logAll);

// Error handling
app.use(errorHandlers.logger);
app.use(errorHandlers.ajax);
app.use(errorHandlers.endOfWorld);

// Our routes
routes.setup(app);

app.use(errorHandlers.send404);

// Start!
app.listen(config.port);

// Used for testing
module.exports = app;

console.log(process.env.NODE_ENV  + ' server running at http://localhost:' + config.port);