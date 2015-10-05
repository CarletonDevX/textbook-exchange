var User = require('mongoose').model('users'),
    crypto = require('crypto'),
    mailer = require('../config/nodemailer'),
    avatars = require('../config/avatars'),
    Error = require('../errors');

// API Calls

exports.countUsers = function (req, res, next) {
    if (!req.rSchoolStats) req.rSchoolStats = {};
    User.count({verified: true}, function (err, count) {
        if (!err) {
            req.rSchoolStats.numUsers = count;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

function validateEmail (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@carleton.edu$/i;
    // ((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$
    return re.test(email);
}

function validatePassword (password) {
    var re = /^[A-Za-z0-9 ]{5,}$/i;
    return re.test(password);
}

exports.createUser = function (req, res, next) {
    var info = req.body;
    var email = info.email;
    var password = info.password;
    if (!validateEmail(email)) {
        Error.errorWithStatus(req, res, 400, 'Must provide a valid Carleton email address.');
        return;
    }
    if (!validatePassword(password)) {
        Error.errorWithStatus(req, res, 400, 'Must provide a valid password (5+ alphanumeric characters).');
        return;
    }

    var newUser = new User({"email": email, "password": password});
    newUser.verified = false;
    newUser.provider = 'local';
    var md5 = crypto.createHash('md5');
    newUser.verifier = md5.update((Math.random()*100).toString()).digest('hex');

    // Optional details
    if (info.name) newUser.name = info.name;
    if (info.avatar) newUser.avatar = info.avatar;
    if (info.bio) newUser.bio = info.bio;
    if (info.gradYear) newUser.gradYear = info.gradYear;

    avatars.getAvatarWithID(null, function (image) {
        newUser.avatar = image;
        newUser.save(function(err, user) {
            if (!err) {
                req.rUser = user;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    });
}

exports.verifyUser = function (req, res, next) {
    var user = req.rUser;
    var verifier = req.body.verifier;
    if (verifier == user.verifier) {
        user.verified = true;

        // Update is used to prevent re-hashing of password
        User.update(
        {_id: user._id},
        {verified : true},
        function (err, result) {
            if (!err) {
                res.status(200).send("User verified.");
            } else {
                Error.mongoError(req, res, err);
            }
        });
    } else {
        Error.errorWithStatus(req, res, 401, 'Incorrect verifier string.')
    }
}


exports.getCurrentUser = function (req, res, next) {
    req.rUser = req.user;
    next();
}

exports.updateUser = function (req, res, next) {
    var user = req.rUser;
    if (req.user._id != user._id) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to update user.');
    } else {
        var updates = req.body;
        // Only these updates are allowed
        if (updates.name) user.name = updates.name;
        if (updates.avatar) user.avatar = updates.avatar;
        if (updates.bio) user.bio = updates.bio;
        if (updates.gradYear) user.gradYear = updates.gradYear;

        user.save(function(err, user) {
            if (!err) {
                req.rUser = user;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
};

exports.removeUser = function (req, res, next) {
    var user = req.rUser;
    user.remove(function (err) {
        if (!err) {
            res.status(200).send("User deleted.");
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getUser = function (req, res, next) {
    // Get ID from either params or previous middleware
    var userID = req.rUserID;
    if (!userID) userID = req.params.userID;

    User.findOne({_id: userID}, function(err, user) {
        if (!err) {
            if (!user) {
                Error.errorWithStatus(req, res, 404, 'User not found by those conditions.');
            } else {
                req.rUser = user;
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getSubscribers = function (req, res, next) {
    var book = req.rBook;
    User.find({_id: {$in : book.subscribers}}, function (err, subscribers) {
        if (!err) {
            req.rSubscribers = subscribers;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.subscribe = function (req, res, next) {
    var book = req.rBook;
    var user = req.rUser;
    for (var i = 0; i < user.subscriptions.length; i++) {
        if (book.ISBN == user.subscriptions[i]) {
            Error.errorWithStatus(req, res, 400, 'User is already subscribed to book.');
            return;
        }
    }

    user.subscriptions.push(book.ISBN);
    user.save(function(err) {
        if (!err) {
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.unsubscribe = function (req, res, next) {
    var book = req.rBook;
    var user = req.rUser;
    var newSubs = [];
    for (var i = 0; i < user.subscriptions.length; i++) {
        var sub = user.subscriptions[i];
        if (sub != book.ISBN) {
            newSubs.push(sub);
        }
    }

    user.subscriptions = newSubs;
    user.save(function(err) {
        if (!err) {
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.clearUserSubscriptions = function (req, res, next) {
    var user = req.rUser;
    user.subscriptions = [];
    user.save(function(err) {
        if (!err) {
            res.status(200).send("Subscriptions cleared.");
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

/************
    LEGACY
*************/

// Verify an account with a given provider ID
exports.verify = function (req, res, next) {
    User.update(
        {email: req.query.email, providerId: req.query.id},
        {verified : true},
        function(err, result) {
            if (!err) {
                if (result.nModified > 0) {
                    req.flash('alert', 'Your account has been verified.');
                }
                return res.redirect('/');
            } else {
                req.flash('error', getErrorMessage(err));
                return res.redirect('/');
            }
        });
};

// Return a user with the profile ID if it exists, else create a new one
exports.saveOAuthUserProfile = function (req, profile, done) {
    User.findOne(
        {email: profile.email},
        function(err, user) {
            if (!err) {
                if (user) {
                    return done(err, user);
                } else {
                    user = new User(profile);
                    user.save(function(err) {
                        if (!err) {
                            return done(err, user);
                        } else {
                            return done(err, false, {message: getErrorMessage(err)})
                        }
                    });
                }
            } else {
                return done(err);
            }
        });
};