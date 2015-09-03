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
    Listing.findOne({_id: listingID}, function(err, listing) {
        if (!err) {
            if (!listing) {
                res.status(404).send('Listing not found by those conditions.');
            } else {
                req.rListing = listing;
                next();
            }
        } else {
            res.json(err);
        }
    });
};

exports.removeListing = function(req, res, next) {
    var listing = req.rListing;
    if (req.user._id != listing.userID) {
        res.status(401).send("Unaithorized to delete listing.");
    } else {
        Listing.remove({_id: listing._id}, function(err) {
            if (!err) {
                res.status(200).send("Listing deleted.");
            } else {
                res.json(err);
            }
        });
    }
};