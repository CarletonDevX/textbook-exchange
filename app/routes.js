var users = require('./controllers/users.controller'),
    books = require('./controllers/books.controller'),
    listings = require('./controllers/listings.controller'),
    offers = require('./controllers/offers.controller'),
    mailer = require('./mailer')
    data = require('./data'),
    passport = require('passport'),
    responder = require('./responseFormatter'),
    inject = require('./injectors'),
    tools = require('./utilities');

var authenticate = function (req, res, next) {
    if (!req.user) {
        res.status(401).send("Unauthorized");
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

	// Main page
    app.get('/', function (req, res) {
        if (!req.user) {
            users.renderLogin(req, res);
        } else {
            users.renderUsers(req, res);
        }
    });

    // db stuff for testing
    app.post('/clear', function (req, res) {
        data.clear();
        res.status(200).send();
    });
    app.post('/populate', function (req, res) {
        data.populate();
        res.status(200).send();
    });

    /****
     API 
    ****/

    /* Auth */

    // Login
    app.route('/api/login')
        .post(passport.authenticate('local'),
            users.getCurrentUser,
            listings.getUserListings,
            inject.BooksIntoListings,
            responder.formatCurrentUser
        );

    // Logout
    app.route('/api/logout')
        .post(function (req, res) {
            req.logout();
            res.status(200).send("Logged out.");
        });

    // Authentification test
    app.route('/api/authTest')
        .get(authenticate, function (req, res) {
            res.status(200).send("Yay");
        });

    /* Users */

    // Get current user
    app.route('/api/user')
        .get(authenticate, 
             users.getCurrentUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatCurrentUser)

    // Update current user
        .put(authenticate, 
             users.getCurrentUser,
             users.updateUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatCurrentUser)

    // Delete current user
        .delete(authenticate,
                users.getCurrentUser,
                users.deleteUser);

    // Get user with user ID
    app.route('/api/user/:userID')
        .get(users.getUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUser);

    /* Subscriptions */

    // Get subscriptions of current user
    app.route('/api/subscriptions')
        .get(authenticate,
             users.getCurrentUser,
             responder.formatSubscriptions);

    // Clear subscriptions of current user
    app.route('/api/subscriptions/clear')
        .post(authenticate,
             users.getCurrentUser,
             users.clearUserSubscriptions);

    // Subscribe current user to book with book ID
    app.route('/api/subscriptions/add/:ISBN')
        .post(authenticate,
             users.getCurrentUser,
             books.getBook,
             books.subscribe,
             users.subscribe,
             responder.formatSubscriptions);

    // Unsubscribe current user from book with book ID
    app.route('/api/subscriptions/remove/:ISBN')
        .post(authenticate,
             users.getCurrentUser,
             books.getBook,
             books.unsubscribe,
             users.unsubscribe,
             responder.formatSubscriptions);

    /* Listings */

    // Get listings for current user
    app.route('/api/listings')
        .get(authenticate, 
             users.getCurrentUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUserListings);

    // Add listing with book ID
    app.route('/api/listings/add/:ISBN')
        .post(authenticate,
             users.getCurrentUser,
             listings.getUserListings,
             books.getBook,
             listings.createListing,
             responder.formatSingleListing);

    // Get listings for user with user ID
    app.route('/api/listings/user/:userID')
        .get(users.getUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUserListings);

    // Get listings for book with book ID
    app.route('/api/listings/book/:ISBN')
        .get(books.getBook,
             listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBookListings);

    // Get listing with listing ID
    app.route('/api/listings/:listingID')
        .get(listings.getListing,
             responder.formatSingleListing)

    // Update listing with listing ID
        .put(authenticate,
             listings.getListing,
             listings.updateListing,
             responder.formatSingleListing)

    // Remove listing with listing ID
        .delete(authenticate,
                listings.getListing,
                listings.removeListing);

    // Make an offer on a listing
    app.route('/api/listings/offer/:listingID')
        .post(authenticate,
              users.getCurrentUser,
              listings.getListing,
              inject.BooksIntoListings,
              offers.makeOffer,
              mailer.sendOfferEmail,
              responder.formatOffer);

    /* Books */

    // Get book with book ID
    app.route('/api/book/:ISBN')
        .get(books.getBook,
             listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBook);

    /* Search */

    // Search
    app.route('/api/search')
        .get(books.search);


    /************
    MOSTLY LEGACY
    *************/

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