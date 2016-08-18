var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Subscription = require('mongoose').model('subscriptions');

exports.getUserSubscriptions = function (req, res, next) {
    var user = req.rUser;
    Subscription.find({userID: user._id}, function (err, subs) {
        if (err) return next(new MongoError(err));
        req.rSubscriptions = subs;
        return next();
    });
};

exports.getBookSubscriptions = function (req, res, next) {
    var book = req.rBook;
    Subscription.find({ISBN: book.ISBN}, function (err, subs) {
        if (err) return next(new MongoError(err));
        req.rSubscriptions = subs;
        return next();
    });
};

exports.add = function (req, res, next) {
    var user = req.rUser;
    var book = req.rBook;
    // Only add if it doesn't exist already
    Subscription.findOne({userID: user._id, ISBN: book.ISBN}, function (err, sub) {
        if (err) return next(new MongoError(err));
        if (sub) return next();
        sub = new Subscription({
            userID: user._id,
            ISBN: book.ISBN,
        });
        sub.save(function (err) {
            if (err) return next(new MongoError(err));
            return next();
        });
    });
};

exports.remove = function (req, res, next) {
    var user = req.rUser;
    var book = req.rBook;
    Subscription.remove({userID: user._id, ISBN: book.ISBN}, function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
}

exports.clearUserSubscriptions = function (req, res, next) {
    var user = req.rUser;
    Subscription.remove({userID: user._id}, function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
};