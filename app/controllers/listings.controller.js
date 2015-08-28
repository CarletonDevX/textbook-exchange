var Listing = require('mongoose').model('listings');

exports.getListingsWithBook = function(req, res, next) {
    ISBN = req.params.ISBN;
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
    listingID = req.params.listingID;
    Listing.find({_id: listingID}, function(err, listings) {
        if (!err) {
        	req.listings = listings;
        	next();
        } else {
            res.json(err);
        }
    });
};