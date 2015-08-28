var Listing = require('mongoose').model('listings');
var User = require('mongoose').model('users');
var utils = require('../utilities')

exports.getListingsWithUser = function(req, res, next) {
    var userID = req.params.userID;
    Listing.find({userID: userID}, function(err, listings) {
        if (!err) {
            req.listings = listings;
            next();
        } else {
            res.json(err);
        }
    });
};

exports.getListingsWithBook = function(req, res, next) {
    var ISBN = req.params.ISBN;
    Listing.find({ISBN: ISBN}).lean().exec(function(err, listings) {
        if (!err) {

            //config for injector
            var userParams = {
                collection: User,
                ID: 'userID',
                localID: '_id',
                newKey: 'user',
                propsNeeded: ['name','gradYear','avatar']
            };

            //inject req'd user data into each listing
            utils.inject(listings, userParams, function(err, augListings){
                req.listings = listings;
            	next();
            });

        } else {
            res.json(err);
        }
    });
};

exports.getListingsWithID = function(req, res, next) {
    var listingID = req.params.listingID;
    Listing.find({_id: listingID}, function(err, listings) {
        if (!err) {
        	req.listings = listings;
        	next();
        } else {
            res.json(err);
        }
    });
};