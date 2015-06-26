process.env.NODE_ENV = 'development';
var config = require('./app/config/config');

// Set up db
var mongoose = require('mongoose');

require('./app/model');
var User = mongoose.model('users');
var db = mongoose.connect(config.db);

// Set up app
var express = require('express'),
    bodyParser = require('body-parser'),
	sass = require('node-sass-middleware'),
	errorHandlers = require('./app/errors'),
	passport = require('passport'),
    flash = require('connect-flash'),
    session = require('express-session'),
	routes = require('./app/routes');

var app = express();

// Frontend
app.use(sass({
    src: __dirname + '/public'
}));

app.use(express.static(__dirname + '/public/'));
app.set('views', './app/views');
app.set('view engine', 'jade');

/* Passport stuff */

// Save user ID in session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Make sure session is valid
passport.deserializeUser(function(id, done) {
    User.findOne(
        {_id: id},
        '-password',
        function(err, user) {
            done(err, user);
        }
    );
});

// Strategies
require('./app/strategies/local.js')();
require('./app/strategies/facebook.js')();
require('./app/strategies/google.js')();

/* REQUESTS */

var logAll = function (req, res, next) {
	console.log(req.method, req.url);
	next();
};

app.use(logAll);

// Sessions
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'joesbigbutt'
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

app.use(errorHandlers.send404);

// Start!
app.listen(config.port);

// Used for testing
module.exports = app;

console.log("Howdy! There's a " + process.env.NODE_ENV  + ' server running at http://localhost:' + config.port);