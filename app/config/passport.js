var passport = require('passport'),
	mongoose = require('mongoose'),
	User = mongoose.model('users');

// Save user ID in session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Make sure session is valid
passport.deserializeUser(function(id, done) {
    User.findOne(
        {_id: id},
        '-password',
        function(err, user) {
            done(err, user);
        }
    );
});

// Strategies
require('../strategies/local.js')();
require('../strategies/facebook.js')();
require('../strategies/google.js')();

module.exports = passport;