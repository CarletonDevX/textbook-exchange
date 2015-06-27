// Local strategy for passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('users');

module.exports = function() {

    // Define authenticate function
    passport.use(new LocalStrategy(function(username, password, done) {

        // Look for a matching user
        User.findOne(
            {email: username},
            function(err, user) {
                var failstring = 'Invalid email address or password.'
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: failstring});
                }
                if (!user.authenticate(password) || !user.verified) {
                    return done(null, false, {message: failstring});
                }
                return done(null, user);
            }
        );
    }));
};