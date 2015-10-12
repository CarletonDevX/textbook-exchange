var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users'),
    Error = require('../errors');

exports.getBook = function(req, res, next) {
    var ISBN = req.params.ISBN;
    Book.findOne({ISBN: ISBN}, function(err, book) {
        if (!err) {
            if (!book) {
                Error.errorWithStatus(req, res, 404, 'Book not found by those conditions.');
            } else {
                req.rBook = book;
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.subscribe = function (req, res, next) {
    var book = req.rBook;
    var user = req.rUser;
    for (var i = 0; i < book.subscribers.length; i++) {
        if (user._id.toString() == book.subscribers[i]) {
            Error.errorWithStatus(req, res, 400, 'User is already subscribed to book.');
            return;
        }
    }

    book.subscribers.push(user._id);
    book.save(function(err) {
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
    for (var i = 0; i < book.subscribers.length; i++) {
        var sub = book.subscribers[i];
        if (sub != user._id.toString()) {
            newSubs.push(sub);
        }
    }

    book.subscribers = newSubs;
    book.save(function(err) {
        if (!err) {
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.search = function(req, res, next) {
    var query = req.query.query;
    if (query == 'undefined') query = '';

    var regex = new RegExp(query, 'i');

    Book.find({$or: [{ISBN: regex}, {name: regex}, {author: regex}, {$text: {$search: query}}]}, {score : {$meta: "textScore"}})
        .sort({score : {$meta : 'textScore'}})
        .exec(function(err, results) {
            if (!err) {
                res.json(results);
            } else {
                Error.mongoError(req, res, err);
            }
        });
};