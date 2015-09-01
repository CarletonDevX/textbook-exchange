var Book = require('mongoose').model('books');
var User = require('mongoose').model('users');
var utils = require('./utilities')


exports.UsersIntoListings = function(req, res, next) {
    //config for injector
    var configParams = {
        collection: User,
        ID: 'userID',
        localID: '_id',
        newKey: 'user',
        propsNeeded: ['name','gradYear','avatar']
    };

    //inject req'd user data into each listing
    utils.inject(req.rListings, configParams, function(err, augListings){
        req.rListings = augListings;
        next();
    });
}

exports.BooksIntoListings = function(req, res, next) {
    //config for injector
    var configParams = {
        collection: Book,
        ID: 'ISBN',
        localID: 'ISBN',
        newKey: 'book',
        propsNeeded: ['coverImage','name','edition']
    };

    //inject req'd user data into each listing
    utils.inject(req.rListings, configParams, function(err, augListings){
        req.rListings = augListings;
        next();
    });
}