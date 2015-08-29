var users = require('./controllers/users.controller'),
    books = require('./controllers/books.controller'),
    listings = require('./controllers/listings.controller'),
    passport = require('passport'),
    responder = require('./responseFormatter');
    inject = require('./injectors');
    tools = require('./utilities')

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
    app.route('/api/user/:userID')
        .get(users.getUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUser);

    // the commented-out api calls are not fixed yet.
    // Listings
    // app.route('/api/listings/user/:userID')
    //     .get(listings.getUserListings,
    //          inject.BooksIntoListings,
    //          responder.formatUserListings);

    // app.route('/api/listings/book/:ISBN')
    //     .get(listings.getBookListings,
    //          inject.UsersIntoListings,
    //          responder.formatBookListings);

    // app.route('/api/listings/:listingID')
    //     .get(listings.getListing,
    //          responder.formatSingleListing);

    // // Books
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
        // scope:['email', 'user_education_history']
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