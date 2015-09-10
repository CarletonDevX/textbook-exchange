var User = require('mongoose').model('users'),
    crypto = require('crypto'),
    mailer = require('../config/nodemailer'),
    avatars = require('../config/avatars'),
    Error = require('../errors');

// API Calls

exports.getCurrentUser = function (req, res, next) {
    req.rUser = req.user;
    next();
}

exports.deleteUser = function (req, res, next) {
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
    var userID = req.params.userID;
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

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@carleton.edu/i;
    // ((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$
    return re.test(email);
}

// Error handling
var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'An account with that email address already exists.';
                break;
            default:
                message = 'Something went wrong.';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message;
            }
        }
    }
    return message;
};

// Create a new user and send a verification email
exports.register = function(req, res, next) {
    var user = new User(req.body);
    if (!validateEmail(user.email)) {
        req.flash('error', 'Please enter a Carleton email address.');
        return res.redirect('/register');
    }
    user.name = {
        givenName: req.body.givenName,
        familyName: req.body.familyName,
        fullName: req.body.givenName + " " + req.body.familyName
    }
    user.verified = false;
    user.provider = 'local';
    var md5 = crypto.createHash('md5');
    user.providerId = md5.update((Math.random()*100).toString()).digest('hex');
    avatars.getAvatarWithID(null, function (image) {
        user.avatar = image;
        user.save(function(err) {
            if (!err) {
                // Send verification email
                link = "http://" + req.get('host') + "/verify?email=" + user.email + "&id=" + user.providerId;
                mailOptions={
                    to : user.email,
                    subject : "Please confirm your email account",
                    html : "Hello,<br> Please click on the link to verify your email.<br><a href=" + link + ">Click here to verify.</a>" 
                }
                mailer.sendMail(mailOptions, function(err2, response) {
                    if(!err2){
                        req.flash('alert', 'Verification email sent.');
                        return res.redirect('/');
                    } else {
                        req.flash('error', 'Verification email not sent.');
                        return res.redirect('/');
                    }
                });
            } else {
                req.flash('error', getErrorMessage(err));
                return res.redirect('/register');
            }
        });
    });
};

// Verify an account with a given provider ID
exports.verify = function(req, res, next) {
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
exports.saveOAuthUserProfile = function(req, profile, done) {
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

// Find and list all users *if logged in*
exports.renderUsers = function(req, res, next) {
    if (req.user) {
        User.find({}, 
            function(err, results) {
                if (!err) {
                    res.render('users', {
                        "Users": results
                    });
                } else {
                    res.json(err);
                }
            });
    } else {
        res.render('error', {
            message: "You need to be logged in to see those!"
        });
    }
};

// Display login page
exports.renderLogin = function(req, res, next) {
    res.render('login', {
        errors: req.flash('error'),
        alerts: req.flash('alert')
    });
}

// Display registration page
exports.renderRegister = function(req, res, next) {
    res.render('register', {
        errors: req.flash('error'),
        alerts: req.flash('alert')
    });
}

// Logout
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};