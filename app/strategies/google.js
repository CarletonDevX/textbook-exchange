// Google strategy for passport
var passport = require('passport'),
    url = require('url'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    config = require('../config/config'),
    users = require('../controllers/users.controller');

module.exports = function() {
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true
    },

    // Define authenticate function
    function(req, accessToken, refreshToken, profile, done) {

        // if (!profile.emails) {
        //     return done(null, false, {message: 'You must allow access to your email address.'});
        // }

        var providerData = profile._json;
        providerData.accessToken = accessToken;
        providerData.refreshToken = refreshToken;

        var providerUserProfile = {
            name: profile.name.givenName + ' ' + profile.name.familyName,
            username: profile.emails[0].value,
            provider: 'google',
            providerId: profile.id,
            providerData: providerData
        };

        // Either logs in or creates new profile
        users.saveOAuthUserProfile(req, providerUserProfile, done);
    }));
};