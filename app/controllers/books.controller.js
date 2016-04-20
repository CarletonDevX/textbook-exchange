var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users'),
    Amazon = require('../config/amazon.js'),
    Error = require('../errors');

exports.getBook = function (req, res, next) {
    req.rISBN = req.rISBN || req.params.ISBN;
    Book.findOne({ISBN: req.rISBN}, function(err, book) {
        if (!err) {
            if (!book) {
                downloadBook(req, res, next);
            } else {
                req.rBook = book;
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

// Separated because over-indentation makes me sad
var downloadBook = function (req, res, next) {
    Amazon.bookWithISBN(req.rISBN, function (err, bookResult) {
        if (!err) {
            if (!bookResult) {
                Error.errorWithStatus(req, res, 404, 'Book not found by those conditions.');
            } else {
                var newBook = new Book(bookResult);

                req.rBook = newBook;
                next();

                // Save it for faster lookup next time (async)
                newBook.save();
            }
        } else {
            Error.errorWithStatus(req, res, 500, err.message);
        }
    });
}

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
    book.save(function(err, book) {
        if (!err) {
            req.rBook = book;
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
    book.save(function(err, book) {
        if (!err) {
            req.rBook = book;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getSubscriptionBooks = function (req, res, next) {
    var subscriptions = req.rUser.subscriptions;
    if (subscriptions.length > 0) {
        Book.find({ISBN: {$in: subscriptions}}, function(err, books) {
            if (!err) {
                req.rBooks = books;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    } else {
        req.rBooks = [];
        next();
    }
    
}

exports.updateAmazonInfo = function (req, res, next) {
    var book = req.rBook;
    Amazon.bookWithISBN(book.ISBN, function (err, bookResult) {
        if (!err) {
            if (!bookResult) {
                Error.errorWithStatus(req, res, 404, 'Amazon info not found for ISBN: ' + book.ISBN);
            } else {
                // Should we update more than just the pricing info?
                book.amazonInfo = bookResult.amazonInfo;
                book.save(function(err, book) {
                    if (!err) {
                        req.rBook = book;
                        next();
                    } else {
                        Error.mongoError(req, res, err);
                    }
                });
            }
        } else {
            Error.errorWithStatus(req, res, 500, err.message);
        }
    });
}

exports.search = function (req, res, next) {
    var query = req.query.query;
    if (query == 'undefined') query = '';
    Amazon.searchWithKeywords(query, function (err, books) {
        req.rBooks = books;
        next();
    });
};