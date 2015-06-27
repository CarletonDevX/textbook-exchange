var mongoose = require('mongoose'),
    crypto = require('crypto');

var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: { type: String, trim: true, unique: true },
    verified: { type: Boolean, default: true },
    verifier: String,
    password: String,
    provider: String,
    providerId: String,
    created: String, // not used yet
    providerData: {},
    books: {}
});

// Before saving, hash password
UserSchema.pre('save',
    function(next) {
        if (this.password) {
            var md5 = crypto.createHash('md5');
            this.password = md5.update(this.password).digest('hex');
        }
        next();
    }
);

// Compare input password to user password
UserSchema.methods.authenticate = function(password) {
    var md5 = crypto.createHash('md5');
    md5 = md5.update(password).digest('hex');

    return this.password === md5;
};

// Add schema to db
mongoose.model('users', UserSchema, 'users');