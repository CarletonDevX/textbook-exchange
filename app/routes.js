var users = require('./controllers/users.controller'),
    passport = require('passport');

exports.setup = function(app) {

    // Template testing
    app.get('/templates', function (req, res) {
        res.render('main',{});
    });
    app.get('/templates/book/:isbn/*', function (req, res) {
        var testObj = {
            ISBN:req.params.isbn,
            book: {
                title: 'An Adventure',
                author: 'David Picardte'
            },
            listings: [
                {ID:'123',
                lister: {
                    URL:'/user/58008',
                    avatar:'',
                    fullName:'DAAVIDD'},
                condition: 'glorious',
                sellingPrice: '$2.00',
                rentingPrice: '$1.99'
                }
            ]
        }
        res.render('book',testObj);
    })

	// Main page
    app.get('/', function (req, res) {
        if (!req.user) {
            users.renderLogin(req, res);
        } else {
            users.renderUsers(req, res);
        }
    });

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
        scope:['email']
    }));

    app.get('/oauth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/',
        successRedirect: '/',
        failureFlash: true,
        scope:['email', 'user_education_history']
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