var mongoose = require('mongoose'),
    crypto = require('crypto');

var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    username: {
        type: String,
        trim: true,
        unique: true
    },
    password: String,
    provider: String,
    providerId: String,
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

// Given a suffix, find an available username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne(
        {username: possibleUsername},
        function(err, user) {
            if (!err) {
                if (!user) {
                    callback(possibleUsername);
                } else {
                    return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
                }
            } else {
                callback(null);
            }
        }
    );
};

// Add schema to db
mongoose.model('User', UserSchema);

module.exports = {
    User: UserSchema
};