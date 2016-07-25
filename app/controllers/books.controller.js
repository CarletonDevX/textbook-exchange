var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users'),
    Amazon = require('../config/amazon.js'),
    HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    AmazonError = require('../errors').AmazonError;

exports.getBook = function (req, res, next) {
    req.rISBN = req.rISBN || req.params.ISBN;
    Book.findOne({ISBN: req.rISBN}, function(err, book) {
        if (err) return next(new MongoError(err));
        if (book) {
            req.rBook = book;
            return next();
        }
        // Download from amazon
        Amazon.bookWithISBN(req.rISBN, function (err, book) {
            if (err) return next(new AmazonError(err));
            if (!book) return next(new HTBError(404, 'Book not found by those conditions.'));
            req.rBook = new Book(book);
            next();
            // Save it for faster lookup next time (async)
            req.rBook.save();
        });
    });
};

exports.subscribe = function (req, res, next) {
    var book = req.rBook;
    var user = req.rUser;
    for (var i = 0; i < book.subscribers.length; i++) {
        if (user._id.toString() == book.subscribers[i]) return next(new HTBError(400, 'User is already subscribed to book.'));
    }
    book.subscribers.push(user._id);
    book.save(function(err, book) {
        if (err) return next(new MongoError(err));
        req.rBook = book;
        return next();
    });
}

exports.unsubscribe = function (req, res, next) {
    var book = req.rBook;
    var user = req.rUser;
    var newSubs = [];
    for (var i = 0; i < book.subscribers.length; i++) {
        if (book.subscribers[i] != user._id.toString()) newSubs.push(book.subscribers[i]);
    }
    book.subscribers = newSubs;
    book.save(function(err, book) {
        if (err) return next(new MongoError(err));
        req.rBook = book;
        return next();
    });
}

exports.getSubscriptionBooks = function (req, res, next) {
    var subscriptions = req.rUser.subscriptions;
    if (subscriptions.length == 0) {
        req.rBooks = [];
        return next();
    }
    Book.find({ISBN: {$in: subscriptions}}, function(err, books) {
        if (err) return next(new MongoError(err));
        req.rBooks = books;
        return next();
    });
}

exports.updateAmazonInfo = function (req, res, next) {
    var book = req.rBook;
    Amazon.bookWithISBN(book.ISBN, function (err, result) {
        if (err) return next(new AmazonError(err));
        if (!result) return next(new HTBError(404, 'Amazon info not found for ISBN: ' + book.ISBN));
        // TODO: Should we update more than just the pricing info?
        book.amazonInfo = result.amazonInfo;
        book.save(function(err, book) {
            if (err) return next(new MongoError(err));
            req.rBook = book;
            return next();
        });
    });
}

exports.search = function (req, res, next) {
    var query = req.query.query || '';
    Amazon.searchWithKeywords(query, function (err, books) {
        if (err) return next(new AmazonError(err));
        req.rBooks = books;
        return next();
    });
};
