var User = require('mongoose').model('users'),
    Report = require('mongoose').model('reports'),
    crypto = require('crypto'),
    mailer = require('../config/nodemailer'),
    Error = require('../errors');

// API Calls

exports.getAllUsers = function (req, res, next) {
    User.find({}, function(err, users) {
        if (!err) {
            req.rUsers = users;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

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

    var newUser = new User({"email": email, "created": new Date()});

    newUser.verifier = crypto.createHash('md5').update((Math.random()*100).toString()).digest('hex');
    newUser.password = crypto.createHash('md5').update(password).digest('hex');

    newUser.verified = false;
    newUser.provider = 'local';

    // Optional details
    if (info.name) newUser.name = info.name;
    if (info.bio) newUser.bio = info.bio;
    if (info.gradYear) newUser.gradYear = info.gradYear;

    newUser.save(function(err, user) {
        if (!err) {
            req.rUser = user;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.verifyUser = function (req, res, next) {
    var updateUser = req.rUser;
    var verifier = req.body.verifier;
    if (verifier != updateUser.verifier) {
        Error.errorWithStatus(req, res, 401, 'Incorrect verifier string.')
    } else {
        updateUser.verified = true;
        updateUser.save(function (err, user) {
            if (!err) {

                // Attempt to log in user (ignore errors)
                req.rUser = user;
                req.login(user, function () {
                    next();
                });

            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
}

exports.getCurrentUser = function (req, res, next) {
    req.rUser = req.user;
    next();
}

exports.updateAvatar = function (req, res, next) {
    var user = req.rUser;
    var avatar = req.rAvatar;
    user.avatar = avatar;

    user.save(function(err, user) {
        if (!err) {
            req.rUser = user;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.updateUser = function (req, res, next) {
    var user = req.rUser;
    if (req.user._id != user._id) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to update user.');
    } else {
        var updates = req.body;
        // Only these updates are allowed
        if (updates.name) user.name = updates.name;
        if (updates.bio) user.bio = updates.bio;
        if (updates.gradYear) user.gradYear = updates.gradYear;
        if (updates.emailSettings) {
            try {
                 user.emailSettings = JSON.parse(updates.emailSettings);
            } catch (err) {
                Error.errorWithStatus(req, res, 400, "Couldn't parse emailSettings object: "+err.message);
                return;
            }
        }

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
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.reportUser = function (req, res, next) {
    var user = req.rUser;
    var description = req.body.description;
    if (!description) {
        Error.errorWithStatus(req, res, 400, 'Must include "description" attribute.');
    } else {
        var report = new Report({
            "userID": user._id,
            "reporterID": req.user._id,
            "description": description,
            "created": new Date()
        });
        user.reports.push(report);
        user.save(function(err, user) {
            if (!err) {
                req.rUser = user;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
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
    if (book.subscribers.length > 0) {
        User.find({_id: {$in : book.subscribers}}, function (err, subscribers) {
            if (!err) {
                req.rSubscribers = subscribers;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    } else {
        req.rSubscribers = [];
        next();
    }
    
}

exports.getUndercutUsers = function (req, res, next) {
    var listings = req.rUndercutListings;
    var userIDs = [];
    for (var i = 0; i < listings.length; i++) {
        userIDs.push(listings[i].userID);
    };
    if (userIDs.length > 0) {
        User.find({_id: {$in : userIDs}}, function (err, users) {
            if (!err) {
                req.rUndercutUsers = users;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    } else {
        req.rUndercutUsers = [];
        next();
    }
    
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
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}