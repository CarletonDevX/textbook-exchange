// Facebook strategy for passport
var passport = require('passport'),
    url = require('url'),
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config/config'),
    users = require('../controllers/users.controller');

module.exports = function() {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        passReqToCallback: true
    },

    // Define authenticate function
    function(req, accessToken, refreshToken, profile, done) {

        if (!profile.emails) {
            return done(null, false, {message: 'You must allow access to your email address.'});
        }

        var providerData = profile._json;
        providerData.accessToken = accessToken;
        providerData.refreshToken = refreshToken;

        var providerUserProfile = {
            name: profile.name.givenName + ' ' + profile.name.familyName,
            email: profile.emails[0].value,
            provider: 'facebook',
            providerId: profile.id,
            providerData: providerData
        };

        // Either logs in or creates new profile
        users.saveOAuthUserProfile(req, providerUserProfile, done);
    }));
};