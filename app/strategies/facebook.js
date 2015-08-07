// Facebook strategy for passport
var passport = require('passport'),
    url = require('url'),
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config/config'),
    users = require('../controllers/users.controller'),
    graph = require('fbgraph');


module.exports = function() {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        passReqToCallback: true
    },

    // Define authenticate function
    function(req, accessToken, refreshToken, profile, done) {

        graph.setAccessToken(accessToken);
        graph.setAppSecret(config.facebook.clientSecret);

        graph.get(profile.id, {fields: 'education'}, function(err, res) {

            if (!profile.emails || !res.education) {
                return done(null, false, {message: 'Inadequate permissions.'});
            }

            var schools = res.education;
            var valid = false;
            for (var i = 0; i < schools.length; i++) {
                var name = schools[i].school.name;
                if (name == 'Carleton College') {
                    valid = true;
                }
            }

            if (!valid) {
                return done(null, false, {message: 'You must have Carleton listed in your education history.'});
            }

            var providerData = profile._json;
            providerData.accessToken = accessToken;
            providerData.refreshToken = refreshToken;

            var providerUserProfile = {
                name: {
                    givenName: profile.name.givenName,
                    familyName: profile.name.familyName,
                    fullName: profile.name.givenName + " " + profile.name.familyName
                },
                avatar: 'http://graph.facebook.com/' + profile.id + '/picture?type=square',
                email: profile.emails[0].value,
                provider: 'facebook',
                providerId: profile.id,
                providerData: providerData
            };

            // Either logs in or creates new profile
            users.saveOAuthUserProfile(req, providerUserProfile, done);
        });
    })); 
};