// Local strategy for passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('users');

module.exports = function() {

    // Define authenticate function
    passport.use(new LocalStrategy(function(username, password, done) {

        // Look for a matching user
        // The "done" callback is specified in routes.js

        User.findOne({email: username}, function(err, user) {
            if (err) return done(err);
            if (!user || !user.authenticate(password)) return done(null, false, false);
            if (!user.verified) return done(null, user, true);
            return done(null, user);
        });
    }));
};