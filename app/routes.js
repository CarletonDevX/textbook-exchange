var users = require('./controllers/users.controller'),
    books = require('./controllers/books.controller'),
    listings = require('./controllers/listings.controller'),
    offers = require('./controllers/offers.controller'),
    avatars = require('./controllers/avatars.controller'),
    mailer = require('./mailer'),
    data = require('./data'),
    Error = require('./errors'),
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

exports.setupMain = function (app) {
    // Main page, in a separate function so it doesn't get buried at the bottom of the file.
    // Only reached if no other routes are engaged (see server.js)
    app.route('/*')
        .get(users.countUsers,          // Should we cache this stuff?
             listings.countListings,
             offers.countOffers,
             function (req, res) {
                res.render('index.jade', {
                    numListings: req.rSchoolStats.numListings,
                    numOffers: req.rSchoolStats.numOffers,
                    numUsers: req.rSchoolStats.numUsers
                });
             }); 
}

exports.setup = function (app) {

    app.route('/partials/:partial')
        .get(function (req, res) {
            res.render('partials/'+req.params.partial+'.jade',{});
        });

    // Workaround for browser autofill
    app.route('/sink')
        .get(function (req, res) {res.status(200).send()})
        .post(function (req, res) {res.status(200).send()});

    // db stuff for testing
    app.post('/clear', function (req, res) {
        data.clear();
        res.status(200).send('Database cleared.');
    });
    app.post('/populate', function (req, res) {
        data.populate();
        res.status(200).send('Database populated.');
    });

    // Send test email
    app.post('/emailTest',
        mailer.sendTestEmail,
        responder.successTestEmail);

    // Send mass update email with email body
    app.post('/email', 
        users.getAllUsers,
        mailer.sendUpdateEmail,
        responder.successUpdateEmail);

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

    /* Schools */
    app.route('/api/schoolStats')
        .get(users.countUsers,
             listings.countListings,
             offers.countOffers,
             responder.formatSchoolStats);

    /* Users */

    // Register/create a user
    app.route('/api/register')
        .post(users.createUser,
              mailer.sendRegistrationEmail,
              responder.formatCurrentUser);

    // Verify a user with user ID
    app.route('/api/verify/:userID')
        .post(users.getUser,
             users.verifyUser,
             responder.formatCurrentUser);

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
                listings.getUserListings,
                offers.getOffersForListings,
                offers.removeOffers,
                listings.removeListings,
                users.removeUser,
                responder.successRemoveUser);

    // Get user with user ID
    app.route('/api/user/:userID')
        .get(users.getUser,
             listings.getUserListings,
             inject.BooksIntoListings,
             responder.formatUser);

    /* Avatars */

    // Upload an avatar photo
    app.route('/api/avatar')
        .post(authenticate,
            users.getCurrentUser,
            avatars.uploadAvatar,
            users.updateAvatar,
            responder.formatCurrentUser);


    /* Reports */

    // Report user with user ID
    app.route('/api/report/:userID')
        .post(authenticate,
             users.getUser,
             users.reportUser,
             responder.successReport);

    /* Subscriptions */

    // Get subscriptions of current user
    app.route('/api/subscriptions')
        .get(authenticate,
             users.getCurrentUser,
             books.getSubscriptionBooks,
             responder.formatBooks);

    // Clear subscriptions of current user
    app.route('/api/subscriptions/clear')
        .post(authenticate,
             users.getCurrentUser,
             users.clearUserSubscriptions,
             responder.successClearSubscriptions);

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
             users.getSubscribers,
             mailer.sendSubscribersEmail,
             listings.getUndercutListings,
             users.getUndercutUsers,
             mailer.sendUndercutEmail,
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
                offers.getOffersForListings,
                offers.removeOffers,
                listings.removeListings,
                responder.successRemoveListing);


    // Get previous offer on a listing
    app.route('/api/listings/offer/:listingID')
        .get(authenticate, 
             users.getCurrentUser,
             listings.getListing,
             offers.getUserOfferForListing,
             responder.formatOffer)

    // Make an offer on a listing
        .post(authenticate,
              users.getCurrentUser,
              listings.getListing,
              inject.BooksIntoListings, // necessary for the email
              inject.UsersIntoListings, // -----------------------
              offers.getOffersForListings,
              offers.makeOffer,
              listings.makeOffer,
              mailer.sendOfferEmail,
              responder.formatOffer);

    // Complete a listing with listing ID
    app.route('/api/listings/complete/:listingID')
        .post(authenticate,
              users.getCurrentUser,
              listings.getListing,
              listings.completeListing,
              responder.formatSingleListing);

    /* Books */

    // Get book with book ID
    app.route('/api/book/:ISBN')
        .get(books.getBook,
             listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBook)

    // Update amazon info of book with book ID (temporary)
        .post(books.getBook,
             books.updateAmazonInfo,
             listings.getBookListings,
             inject.UsersIntoListings,
             responder.formatBook);

    /* Search */

    // Search
    app.route('/api/search')
        .get(books.search,
             responder.formatBooks);

    // Catchall 404 for API
    app.route('/api/*').get(Error.api404).post(Error.api404).put(Error.api404).delete(Error.api404);

};