var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users'),
    Amazon = require('../config/amazon.js'),
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

exports.updateAmazonInfo = function (req, res, next) {
    var book = req.rBook;
    Amazon.infoForBook(book, function (err, info) {
        if (!err) {
            book.amazonInfo = info;
            book.save(function(err) {
                if (!err) {
                    next();
                } else {
                    Error.mongoError(req, res, err);
                }
            });
        } else {
            Error.errorWithStatus(req, res, 500, err.message);
        }
    });
}

exports.search = function (req, res, next) {
    var query = req.query.query;
    if (query == 'undefined') query = '';
    Amazon.searchWithKeywords(query, function (err, books) {
        res.json(books);
    });

    // var regex = new RegExp(query, 'i');
    // var ISBNquery = query.replace(/[- ]/g, "");
    // var ISBNregex = new RegExp(ISBNquery, 'i');

    // Book.find({$or: [{ISBN: ISBNregex}, {name: regex}, {author: regex}, {$text: {$search: query}}]}, {score : {$meta: "textScore"}})
    //     .sort({score : {$meta : 'textScore'}})
    //     .exec(function(err, results) {
    //         if (!err) {
    //             res.json(results);
    //         } else {
    //             Error.mongoError(req, res, err);
    //         }
    //     });
};