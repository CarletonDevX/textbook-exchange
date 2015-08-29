var Listing = require('mongoose').model('listings');

exports.getUserListings = function(req, res, next) {
    var userID = req.params.userID;
    Listing.find({userID: userID}).lean().exec(function(err, listings) {
        if (!err) {
            req.listings = listings;
            next();
        } else {
            res.json(err);
        }
    });
};

exports.getBookListings = function(req, res, next) {
    var ISBN = req.params.ISBN;
    Listing.find({ISBN: ISBN}).lean().exec(function(err, listings) {
        if (!err) {
            req.listings = listings
            next();
        } else {
            res.json(err);
        }
    });
};

exports.getListing = function(req, res, next) {
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