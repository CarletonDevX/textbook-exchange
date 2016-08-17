var crypto = require('crypto'),
    Schema = require('mongoose').Schema;

var User = new Schema({
    name: {
        givenName: { type: String, required: true, maxlength: 35 },
        familyName: { type: String, required: true, maxlength: 35 },
        fullName: { type: String, required: true },
    },
    email: { type: String, unique: true, required: true },
    emailSettings: {
        watchlist: { type: Boolean, default: true, required: true },
        undercut: { type: Boolean, default: false, required: true },
        updates: { type: Boolean, default: true, required: true },
    },
    verifier: String,
    verified: { type: Boolean, default: true },
    password: { type: String, required: true },
    provider: String,
    providerId: String,
    providerData: {},
    subscriptions: [],
    bio: { type: String, maxlength: 200 },
    avatar: { type: String, default: 'https://d30y9cdsu7xlg0.cloudfront.net/png/5020-200.png' },
    gradYear: { type: Number, required: true },
    reports: [],
    offers: [],
    created: { type: Date, default: new Date() },
});

// Compare input password to user password
User.methods.authenticate = function (password) {
    return this.password === crypto.createHash('md5').update(password).digest('hex');
};

// Validation
var validYears = function () {
    var lastYear = new Date().getFullYear() - 1;
    var yearRange = 6;
    var years = [];
    for (var i = 0; i < yearRange; i++) years.push(lastYear+i);
    return years;
};

var validateGradYear = function (value) {
    return (validYears().indexOf(value) > -1);
};

User.path('gradYear').validate(validateGradYear, '"gradYear" must be a value between ' + validYears()[0] + ' and '+ validYears().pop());

module.exports = User;
