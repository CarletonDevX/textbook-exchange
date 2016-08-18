var crypto = require('crypto'),
    HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    User = require('mongoose').model('users');

var hash = function (string) {
    return crypto.createHash('md5').update(string).digest('hex');
};

exports.getAllUsers = function (req, res, next) {
    User.find({verified: true}, function (err, users) {
        if (err) return next(new MongoError(err));
        req.rUsers = users;
        return next();
    });
};

exports.countUsers = function (req, res, next) {
    if (!req.rSchoolStats) req.rSchoolStats = {};
    User.count({verified: true}, function (err, count) {
        if (err) return next(new MongoError(err));
        req.rSchoolStats.numUsers = count;
        return next();
    });
};

var validateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@carleton.edu$/i;
    return re.test(email);
};

var validatePassword = function (password) {
    var re = /^[A-Za-z0-9 ]{5,}$/i;
    return re.test(password);
};

var validateRegistrationInfo = function (info, callback) {
    var err = null;
    if (info.username == null || !validateEmail(info.username)) {
        err = new HTBError(400, 'Must provide a valid Carleton email address.');
    } else if (info.password == null || !validatePassword(info.password)) {
        err = new HTBError(400, 'Must provide a valid password (5+ alphanumeric characters).');
    } else if (info.givenName == null) {
        err = new HTBError(400, 'Must provide "givenName" attribute.');
    } else if (info.familyName == null) {
        err = new HTBError(400, 'Must provide "familyName" attribute.');
    } else if (info.gradYear == null) {
        err = new HTBError(400, 'Must provide "gradYear" attribute.');
    }
    return callback(err);
};

exports.registerUser = function (req, res, next) {
    // Make sure all the info is there
    validateRegistrationInfo(req.body, function (err) {
        if (err) return next(err);
        // Before creating a new user, check to make sure they haven't already registered
        User.findOne({email: req.body.username}, function (err, user) {
            if (err) return next(new MongoError(err));
            if (!user) {
                createUser(req, res, next);
            } else if (!user.verified) {
                // If unverified, overwrite
                user.remove(function (err) {
                    if (err) return next(new MongoError(err));
                    createUser(req, res, next);
                });
            } else {
                next(new HTBError(400, 'A user with this email already exists.'));
            }
        });
    });
};

var createUser = function (req, res, next) {
    var info = req.body;
    var newUser = new User({
        email: info.username,
        name: {
            givenName: info.givenName,
            familyName: info.familyName,
            fullName: info.givenName + ' ' + info.familyName,
        },
        verifier: hash((Math.random()*100).toString()),
        password: hash(info.password),
        verified: false,
        provider: 'local',
        gradYear: info.gradYear,
        // This may be null
        bio: info.bio,
    });
    newUser.save(function (err, user) {
        if (err) return next(new MongoError(err));
        req.rUser = user;
        return next();
    });
};

exports.verifyUser = function (req, res, next) {
    var user = req.rUser;
    var verifier = req.query.verifier || req.body.verifier;
    if (!verifier) return next(new HTBError(400, 'Must include "verifier" attribute.'));
    if (verifier != user.verifier) return next(new HTBError(401, 'Incorrect verifier string.'));
    user.verified = true;
    user.save(function (err, user) {
        if (err) return next(new MongoError(err));
        // Attempt to log in user
        req.rUser = user;
        req.login(user, function (err) {
            if (err) return next(new HTBError(500, 'Login failed.'));
            return next();
        });
    });
};

exports.resetPassword = function (req, res, next) {
    var user = req.rUser;
    var verifier = req.query.verifier || req.body.verifier;
    if (!verifier) return next(new HTBError(400, 'Must include "verifier" attribute.'));
    if (verifier != user.verifier) return next(new HTBError(401, 'Incorrect verifier string.'));
    // Generate new password (and verifier so call isn't made twice)
    var password = hash((Math.random()*100).toString());
    user.verifier = hash((Math.random()*100).toString());
    user.password = hash(password);
    user.save(function (err, user) {
        if (err) return next(new MongoError(err));
        req.rUser = user;
        req.rPassword = password;
        return next();
    });
};

var getUserWithID = function (userID, verified, callback) {
    // A helper for getUser and getUnverifiedUser
    if (!userID) return callback(new HTBError(400, 'No userID provided.'));
    User.findOne({_id: userID, verified: {$in: [verified, true]}}, function (err, user) {
        if (err) return callback(new MongoError(err));
        if (!user) return callback(new HTBError(404, 'User not found by those conditions.'));
        return callback(null, user);
    });
};

var getUserWithUsername = function (username, verified, callback) {
    // A helper for getUserWithEmail and getUserWithEmailUnverified
    if (!username) return callback(new HTBError(400, 'Must include "username" attribute.'));
    User.findOne({email: username, verified: {$in: [verified, true]}}, function (err, user) {
        if (err) return callback(new MongoError(err));
        if (!user) return callback(new HTBError(404, 'User not found by those conditions.'));
        return callback(null, user);
    });
};

exports.getCurrentUser = function (req, res, next) {
    // Can we all just apprectiate how dope this function is
    req.rUser = req.user;
    return next();
};

exports.getUser = function (req, res, next) {
    var userID = req.rUserID || req.params.userID || req.query.userID;
    getUserWithID(userID, true, function (err, user) {
        if (err) return next(err);
        req.rUser = user;
        return next();
    });
};

exports.getUnverifiedUser = function (req, res, next) {
    // NOTE: Gets both unverified and verified users
    var userID = req.rUserID || req.params.userID || req.query.userID;
    getUserWithID(userID, false, function (err, user) {
        if (err) return next(err);
        req.rUser = user;
        return next();
    });
};

exports.getUserWithEmail = function (req, res, next) {
    var username = req.body.username;
    getUserWithUsername(username, true, function (err, user) {
        if (err) return next(err);
        req.rUser = user;
        return next();
    });
};

exports.getUnverifiedUserWithEmail = function (req, res, next) {
    // NOTE: Gets both unverified and verified users
    var username = req.body.username;
    getUserWithUsername(username, false, function (err, user) {
        if (err) return next(err);
        req.rUser = user;
        return next();
    });
};

exports.updateAvatar = function (req, res, next) {
    var user = req.rUser;
    var avatar = req.rAvatar;
    user.avatar = avatar;
    user.save(function (err, user) {
        if (err) return next(new MongoError(err));
        req.rUser = user;
        return next();
    });
};

exports.updateUser = function (req, res, next) {
    var user = req.rUser;
    var updates = req.body;
    if (updates.bio) user.bio = updates.bio;
    if (updates.gradYear) user.gradYear = updates.gradYear;
    if (updates.emailSettings) {
        try {
            user.emailSettings = JSON.parse(updates.emailSettings);
        } catch (err) {
            return next(new HTBError(400, 'Couldn\'t parse emailSettings object: '+err.message));
        }
    }
    if (updates.givenName != null) user.name.givenName = updates.givenName;
    if (updates.familyName != null) user.name.familyName = updates.familyName;
    user.name.fullName = user.name.givenName + ' ' + user.name.familyName;
    if (updates.password) {
        if (!updates.oldPassword) return next(new HTBError(400, 'Must include "oldPassword" attribute.'));
        if (!user.authenticate(updates.oldPassword)) return next(new HTBError(401, 'Invalid password.'));
        user.password = hash(updates.password);
    }
    user.save(function (err, user) {
        if (err) return next(new MongoError(err));
        req.rUser = user;
        return next();
    });
};

exports.removeUser = function (req, res, next) {
    var user = req.rUser;
    user.remove(function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
};

exports.getSubscriptionUsers = function (req, res, next) {
    var subscriptions = req.rSubscriptions;
    var userIDs = [];
    for (var i = 0; i < subscriptions.length; i++) {
        userIDs.push(subscriptions[i].ISBN);
    };
    User.find({_id: {$in: userIDs}}, function (err, users) {
        if (err) return next(new MongoError(err));
        req.rUsers = users;
        return next();
    });
};

exports.getUndercutUsers = function (req, res, next) {
    var listings = req.rUndercutListings;
    var userIDs = [];
    for (var i = 0; i < listings.length; i++) {
        userIDs.push(listings[i].userID);
    }
    if (userIDs.length == 0) {
        req.rUsers = [];
        return next();
    }
    User.find({_id: {$in : userIDs}}, function (err, users) {
        if (err) return next(new MongoError(err));
        req.rUsers = users;
        return next();
    });
};

exports.makeOffer = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    user.offers.push(listing._id.toString());
    user.save(function (err) {
        if (err) return next(new MongoError(err));
        req.rUser = user;
        return next();
    });
};

exports.search = function (req, res, next) {
    var query = req.query.query;
    req.rUsers = [];
    if (!query) return next();
    var re = new RegExp('\w*'+query+'\w*', 'i');
    User.find({verified: true}, function (err, users) {
        if (err) return next(new MongoError(err));
        for (var i = users.length - 1; i >= 0; i--) {
            var user = users[i];
            if (re.test(user.name.fullName)) {
                req.rUsers.push(user);
            }
        }
        return next();
    });
};
