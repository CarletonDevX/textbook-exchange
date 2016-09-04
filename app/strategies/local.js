// Local strategy for passport
var LocalStrategy = require('passport-local').Strategy,
    passport = require('passport'),
    User = require('mongoose').model('users');

module.exports = function () {

    // Define authenticate function
    passport.use(new LocalStrategy(function (username, password, done) {
        // Look for a matching user
        // The "done" callback is specified in routes.js
        User.findOne({email: username.toLowerCase()}, function (err, user) {
            if (err) return done(err);
            if (!user || !user.authenticate(password)) return done(null, null);
            return done(null, user);
        });
    }));
};
