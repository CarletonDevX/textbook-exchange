var Listing = require('mongoose').model('listings');

exports.getUserListings = function(req, res, next) {
    var userID = req.rUser._id;
    Listing.find({userID: userID}).lean().exec(function(err, listings) {
        if (!err) {
            req.rListings = listings;
            next();
        } else {
            res.json(err);
        }
    });
};

exports.getBookListings = function(req, res, next) {
    var ISBN = req.rBook.ISBN;
    Listing.find({ISBN: ISBN}).lean().exec(function(err, listings) {
        if (!err) {
            req.rListings = listings
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
        	req.rListings = listings;
        	next();
        } else {
            res.json(err);
        }
    });
};