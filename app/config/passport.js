var HTBError = require('../errors').HTBError,
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('users');

// Save user ID in session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// Make sure session is valid
passport.deserializeUser(function (id, done) {
    User.findOne(
        {_id: id},
        // '-password',
        function (err, user) {
            done(err, user);
        }
    );
});

// Strategies
require('../strategies/local.js')();

passport.attemptLogin = function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) return next(new HTBError(500, err.message));
        if (!user) return next(new HTBError(401, 'Incorrect email or password'));
        if (!user.verified) next(new HTBError(400, 'User is not verified'));
        req.login(user, function (err) {
            if (err) return next(new HTBError(500, 'Login failed.'));
            next();
        });  
    })(req, res, next);
};

module.exports = passport;