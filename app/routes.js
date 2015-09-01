var users = require('./controllers/users.controller'),
    books = require('./controllers/books.controller'),
    listings = require('./controllers/listings.controller'),
    passport = require('passport'),
    responder = require('./responseFormatter');
    inject = require('./injectors');
    tools = require('./utilities')

var authenticate = function (req, res, next) {
    if (!req.user) {
        res.status(401).send("Not authorized.");
    } else {
        next();
    }
}

exports.setup = function(app) {

    // Workin on dem angular stuff inside /app/whatever
    app.get('/app/*', function (req, res) {
        res.render('app/index.jade',{});
    });
    app.get('/partials/:partial', function (req, res) {
        res.render('app/partials/'+req.params.partial+'.jade',{});
    });

    // //old login/testing routes:    
    // app.get('/templates/book', function(req, res) {
    //     books.renderBook(req, res); 
    // });

	// Main page
    app.get('/', function (req, res) {
        if (!req.user) {
            users.renderLogin(req, res);
        } else {
            users.renderUsers(req, res);
        }
    });

    /* API */

    // Users
    // (e.g., for the top half of a user page)

    app.route('/api/login')
        .post(passport.authenticate('local'), function (req, res) {
            res.status(200).send("Logged in");
        });

    app.route('/api/logout')
        .post(function (req, res) {
            req.logout();
            res.status(200).send("Logged out");
        });

    app.route('/api/authTest')
        .get(authenticate, function (req, res) {
            res.status(200).send("Yay");
        });

    app.route('/api/user/:userID')
        .get(users.getUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUser);

    // Listings
    app.route('/api/listings/user/:userID')
        .get(listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUserListings);

    app.route('/api/listings/book/:ISBN')
        .get(listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBookListings);

    app.route('/api/listings/:listingID')
        .get(listings.getListing,
             responder.formatSingleListing);

    // Books
    app.route('/api/book/:ISBN')
        .get(books.getBook,
             listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBook);

    app.route('/api/search')
        .get(books.search);


    // Local strategy login and registration
    app.route('/login')
        .get(users.renderLogin)
        .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }));

    app.route('/register')
        .get(users.renderRegister)
        .post(users.register);

    app.get('/verify', users.verify);

    app.get('/logout', users.logout);

    // Facebook
    app.get('/oauth/facebook', passport.authenticate('facebook', {
        failureRedirect: '/',
        scope:['email', 'user_education_history']
    }));

    app.get('/oauth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/',
        successRedirect: '/',
        failureFlash: true,
    }));

    // Google
    app.get('/oauth/google', passport.authenticate('google', {
        failureRedirect: '/',
        scope:['email']
    }));

    app.get('/oauth/google/callback', passport.authenticate('google', {
        failureRedirect: '/',
        successRedirect: '/',
        failureFlash: true,
        scope:['email']
    }));
};