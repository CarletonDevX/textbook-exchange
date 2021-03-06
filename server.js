process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./app/config/config');

// Set up db
var mongoose = require('mongoose');
mongoose.connect(config.db);
require('./app/models');

var assetManager = require('connect-assetmanager'),
    bodyParser = require('body-parser'),
    express = require('express'),
    handlers = require('./app/errors'),
    passport = require('./app/config/passport'),
    routes = require('./app/routes'),
    sass = require('node-sass-middleware'),
    session = require('express-session'),
    normalizers = require('./app/normalizers');

var app = express();

// Frontend
app.use(sass({
    src: __dirname + '/public',
}));

// Concatenate and minify JS
var assetsManagerMiddleware = assetManager({
    'js': {
        'route': /\/static\/scripts\/client\.js/,
        'path': './public/scripts/',
        'dataType': 'javascript',
        'stale': false, // ignore cache
        'debug': true, // don't minify for now
        'files': [
            'utils.js',
            'main.js',
            'api.js', // This order is important
        ],
    },
});

app.use('/'
    , assetsManagerMiddleware
    , express.static(__dirname + '/public', { maxAge: 172800000 }) // 2 days
);

app.set('views', './app/views');
app.set('view engine', 'pug');
// force terse attributes on pug templates (e.g. ui-view not ui-view="ui-view")
app.locals.doctype = 'html';

/* REQUESTS */

var logAll = function (req, res, next) {
    console.log(req.method, req.url, res.statusCode);
    next();
};

if (process.env.NODE_ENV == 'development') app.use(logAll);

// Limit to subdomain
app.set('subdomain offset', config.subdomain_offset);
// app.use(function (req, res, next) {
//     var subs = req.subdomains;
//     if (subs.length != 1 || subs[0] != 'carleton') return res.render('catchall.pug', {url: config.url});
//     req.subdomain = subs[0];
//     next();
// });

// Sessions
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'ayylmao',
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Form parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// normalizers
app.use(normalizers.lowerCaseEmail);

// Our routes
routes.setup(app);
routes.setupMain(app);

// Error handling
app.use(handlers.send404);
app.use(handlers.sendHTBErrors);
app.use(handlers.endOfWorld);

// Start!
app.listen(config.port);

// Used for testing
module.exports = app;

console.log('Howdy! There\'s a ' + process.env.NODE_ENV  + ' server running at http://localhost:' + config.port);
