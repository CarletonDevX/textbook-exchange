var Book = require('mongoose').model('books');
var User = require('mongoose').model('users');
var Listing = require('mongoose').model('listings');
var MongoError = require('./errors.js').MongoError;
var utils = require('./utilities');

exports.UsersIntoListings = function (req, res, next) {
    // config for injector
    var configParams = {
        collection: User,
        ID: 'userID',
        localID: '_id',
        newKey: 'user',
        propsNeeded: ['name', 'gradYear', 'avatar', 'email'],
    };
    // inject req'd user data into each listing
    utils.inject(req.rListings, configParams, function (err, augListings) {
        if (err) return next(new MongoError(err));
        req.rListings = augListings;
        next();
    });
};

exports.BooksIntoListings = function (req, res, next) {
    // config for injector
    var configParams = {
        collection: Book,
        ID: 'ISBN',
        localID: 'ISBN',
        newKey: 'book',
        propsNeeded: ['coverImage', 'name', 'edition'],
    };
    // inject req'd user data into each listing
    utils.inject(req.rListings, configParams, function (err, augListings) {
        if (err) return next(new MongoError(err));
        req.rListings = augListings;
        next();
    });
};

exports.ListingsIntoBooks = function (req, res, next) {
    var books = req.rBooks;
    var ISBNs = [];
    var listingDict = {};

    // This is similar to what utils.inject does, but we're injecting into multiple objects
    for (var i = 0; i < books.length; i++) {
        ISBNs.push(books[i].ISBN);
        listingDict[books[i].ISBN] = [];
    }
    Listing.find({ISBN: {$in: ISBNs}}, function (err, listings) {
        if (err) return next(new MongoError(err));
        // Map listings to books
        for (var i = 0; i < listings.length; i++) {
            listingDict[listings[i].ISBN].push(listings[i]);
        }
        var newBooks = [];
        for (var i = 0; i < books.length; i++) {
            books[i].listings = listingDict[books[i].ISBN];
            newBooks.push(books[i]);
        }
        req.rBooks = newBooks;
        next();
    });
};
