var User = require('mongoose').model('users'),
    crypto = require('crypto'),
    mailer = require('../config/nodemailer');

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
    user.verified = false;
    user.provider = 'local';
    var md5 = crypto.createHash('md5');
    user.providerId = md5.update((Math.random()*100).toString()).digest('hex');
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