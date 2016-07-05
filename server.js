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
        'debug': true, // don't minify for now
        'files': [
            "utils.js",
            "main.js",
            "api.js" // This order is important
        ]
    }
});

app.use('/'
    , assetsManagerMiddleware
    , express.static(__dirname + '/public', { maxAge: 172800000 }) // 2 days
);


app.set('views', './app/views');
app.set('view engine', 'jade');
//force terse attributes on jade templates (e.g. ui-view not ui-view="ui-view")
app.locals.doctype = 'html';


/* REQUESTS */

var logAll = function (req, res, next) {
	console.log(req.method, req.url, res.statusCode);
	next();
};

if (process.env.NODE_ENV == 'development') app.use(logAll);

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
