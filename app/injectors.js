var Book = require('mongoose').model('books');
var User = require('mongoose').model('users');
var Error = require('./errors.js');
var utils = require('./utilities');


exports.UsersIntoListings = function(req, res, next) {

    //config for injector
    var configParams = {
        collection: User,
        ID: 'userID',
        localID: '_id',
        newKey: 'user',
        propsNeeded: ['name', 'gradYear', 'avatar', 'email']
    };

    //inject req'd user data into each listing
    utils.inject(req.rListings, configParams, function(err, augListings){
        if (!err) {
            req.rListings = augListings;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
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
        if (!err) {
            req.rListings = augListings;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}