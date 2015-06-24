var User = require('mongoose').model('users');

// Create a new user
exports.create = function(req, res, next) {
    var user = new User(req.body);
    user.save(function(err) {
        if (!err) {
            next(user);
        } else {
            res.json(err);
        }
    });
};

// Find all users
exports.list = function(req, res, next) {
    User.find({}, function(err, results) {
        if (!err) {
            res.render('users', {
                "Users": results
            })
        } else {
            res.json(err);
        }
    });
};