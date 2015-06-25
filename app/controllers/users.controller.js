var User = require('mongoose').model('users');

// Error handling
var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'Something went wrong';
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

// Register a new user
exports.register = function(req, res, next) {
    if (!req.user) {
        var user = new User(req.body);
        user.provider = 'local';
        user.save(function(err) {
            if (!err) {
                req.login(user, function(err2) {
                    if (!err2) {
                        return res.redirect('/');
                    } else {
                        return next(err2);
                    }
                });
            } else {
                var message = getErrorMessage(err);
                req.flash('error', message);
                return res.redirect('/register');
            }
        });
    } else {
        return res.redirect('/');
    }
};

// Find and list all users *if logged in*
exports.renderUsers = function(req, res, next) {
    if (req.user) {
        User.find({}, function(err, results) {
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
        messages: req.flash('error')
    });
}

// Display registration page
exports.renderRegister = function(req, res, next) {
    res.render('register', {
        messages: req.flash('error')
    });
}

// Logout
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};