// Local strategy for passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('users');

module.exports = function() {
    passport.use(new LocalStrategy(function(username, password, done) {
        // Look for a matching user
        User.findOne(
            {username: username},
            function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {message: 'Unknown user'});
                }

                if (!user.authenticate(password)) {
                    return done(null, false, {message: 'Invalid password'});
                }

                return done(null, user);
            }
        );
    }));
};