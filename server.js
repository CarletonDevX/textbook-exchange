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
    assetManager = require('connect-assetmanager'),
	passport = require('./app/config/passport'),
    session = require('express-session'),
    mailer = require('./app/config/nodemailer'),
	routes = require('./app/routes');

var app = express();

// Frontend
app.use(sass({
    src: __dirname + '/public'
}));

// Concatenate and minify JS
var assetsManagerMiddleware = assetManager({
    'js': {
        'route': /\/static\/scripts\/client\.js/,
        'path': "./public/scripts/",
        'dataType': 'javascript',
        'files': [
            "https://code.jquery.com/jquery-1.11.3.min.js",
            "https://rawgit.com/Box9/jss/master/jss.js",
            "https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.4/angular.js",
            "https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.js",
            "https://rawgit.com/christopherthielen/ui-router-extras/master/release/ct-ui-router-extras.js",
            "*" // All our files
        ]
    }
});

app.use('/'
    , assetsManagerMiddleware
    , express.static(__dirname + '/public')
);


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

// Form parsing
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