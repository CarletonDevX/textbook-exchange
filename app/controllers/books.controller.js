var Amazon = require('../config/amazon.js'),
    AmazonError = require('../errors').AmazonError,
    Book = require('mongoose').model('books'),
    HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError;

exports.getBook = function (req, res, next) {
    req.rISBN = req.rISBN || req.params.ISBN;
    Book.findOne({ISBN: req.rISBN}, function (err, book) {
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

exports.getSubscriptionBooks = function (req, res, next) {
    var subscriptions = req.rSubscriptions;
    var ISBNs = [];
    for (var i = 0; i < subscriptions.length; i++) {
        ISBNs.push(subscriptions[i].ISBN);
    };
    Book.find({ISBN: {$in: ISBNs}}, function (err, books) {
        if (err) return next(new MongoError(err));
        req.rBooks = books;
        return next();
    });
};

exports.updateAmazonInfo = function (req, res, next) {
    var book = req.rBook;
    Amazon.bookWithISBN(book.ISBN, function (err, result) {
        if (err) return next(new AmazonError(err));
        if (!result) return next(new HTBError(404, 'Amazon info not found for ISBN: ' + book.ISBN));
        book.amazonInfo = result.amazonInfo;
        book.save(function (err, book) {
            if (err) return next(new MongoError(err));
            req.rBook = book;
            return next();
        });
    });
};

exports.search = function (req, res, next) {
    var query = req.query.query || '';
    Amazon.searchWithKeywords(query, function (err, books) {
        if (err) return next(new AmazonError(err));
        req.rBooks = books;
        return next();
    });
};
