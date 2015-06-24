process.env.NODE_ENV = 'development';
var config = require('./app/config/config');

// Set up db
var mongoose = require('mongoose'),
	model = require('./app/model'),
	User = model.User;

db = mongoose.connect(config.db);

// Set up app
var express = require('express'),
    bodyParser = require('body-parser'),
	sass = require('node-sass-middleware'),
	errorHandlers = require('./app/errors'),
	passport = require('passport'),
	routes = require('./app/routes');

var app = express();

// Frontend
app.use(sass({
    src: __dirname + '/public'
}));

app.use(express.static(__dirname + '/public/'));
app.set('views', './app/views');
app.set('view engine', 'jade');

/* AUTH */

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     User.findOne(
//         {_id: id},
//         '-password',
//         function(err, user) {
//             done(err, user);
//         }
//     );
// });

require('./app/strategies/local.js')();


/* REQUESTS */

var logAll = function (req, res, next) {
	console.log(req.method, req.url);
	next();
};

app.use(logAll);

// app.use(passport.initialize());
// app.use(passport.session());

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