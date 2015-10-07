process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./app/config/config')();

// Set up db
var mongoose = require('mongoose');
var db = mongoose.connect(config.db);

require('./app/model');
// var User = mongoose.model('users');

// Set up app
var express = require('express'),
    bodyParser = require('body-parser'),
	sass = require('node-sass-middleware'),
	errorHandlers = require('./app/errors'),
	passport = require('./app/config/passport'),
    flash = require('connect-flash'),
    session = require('express-session'),
    mailer = require('./app/config/nodemailer'),
	routes = require('./app/routes');

var app = express();

// Frontend
app.use(sass({
    src: __dirname + '/public'
}));

app.use(express.static(__dirname + '/public/'));
app.set('views', './app/views');
app.set('view engine', 'jade');
//force terse attributes on jade templates (e.g. ui-view not ui-view="ui-view")
app.locals.doctype = 'html';


/* REQUESTS */

var logAll = function (req, res, next) {
	console.log(req.method, req.url);
	next();
};

if ('process.env.NODE_ENV' == 'development') app.use(logAll);

// Sessions
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'ayylmao'
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Error handling
app.use(errorHandlers.logger);
app.use(errorHandlers.ajax);
app.use(errorHandlers.endOfWorld);

// Our routes
routes.setup(app);
routes.setupMain(app);

app.use(errorHandlers.send404);

// Start!
app.listen(config.port);

// Used for testing
module.exports = app;

console.log("Howdy! There's a " + process.env.NODE_ENV  + ' server running at http://localhost:' + config.port);