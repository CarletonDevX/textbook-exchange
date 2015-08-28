var Listing = require('mongoose').model('listings');

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
    Listing.find({ISBN: ISBN}, function(err, listings) {
        if (!err) {
        	req.listings = listings;
        	next();
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