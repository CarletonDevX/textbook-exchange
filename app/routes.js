var users = require('./controllers/users.controller'),
    books = require('./controllers/books.controller'),
    passport = require('passport');

exports.setup = function(app) {

    // Workin on dem angular stuff inside /app/whatever
    app.get('/app/*', function (req, res) {
        res.render('app/main',{});
    });
    app.get('/partials/:partial', function (req, res) {
        res.render('app/partials/'+req.params.partial,{});
    });

    //old login/testing routes:    
    app.get('/templates/book', function(req, res) {
        books.renderBook(req, res); 
    });

	// Main page
    app.get('/', function (req, res) {
        if (!req.user) {
            users.renderLogin(req, res);
        } else {
            users.renderUsers(req, res);
        }
    });

    // Book
    app.route('/api/book/*')
        .get(books.getBook);

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