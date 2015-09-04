var Listing = require('mongoose').model('listings'),
    Error = require('../errors');

exports.getUserListings = function(req, res, next) {
    var userID = req.rUser._id;
    Listing.find({userID: userID}).lean().exec(function(err, listings) {
        if (!err) {
            req.rListings = listings;
            next();
        } else {
            Error.mongoError(req, res, err);
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
            Error.mongoError(req, res, err);
        }
    });
};

exports.getListing = function(req, res, next) {
    var listingID = req.params.listingID;
    Listing.findOne({_id: listingID}, function(err, listing) {
        if (!err) {
            if (!listing) {
                Error.errorWithStatus(req, res, 404, 'Listing not found by those conditions.');
            } else {
                req.rListing = listing;
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.createListing = function(req, res, next) {
    var userListings = req.rListings;
    for (var i = 0; i < userListings.length; i++) {
        if (userListings[i].ISBN == req.rBook.ISBN) {
            Error.errorWithStatus(req, res, 400, 'User already has a listing for this book. ID: ' + userListings[i]._id);
            return;
        }
    }

    var newListing = new Listing(req.body);
    if (!(newListing.sellingPrice || newListing.rentingPrice)) {
        Error.errorWithStatus(req, res, 400, 'Must include selling or renting price.');
        return;
    }

    newListing.userID = req.user._id;
    newListing.ISBN = req.rBook.ISBN;
    newListing.created = new Date();

    newListing.save(function(err, listing) {
        if (!err) {
            req.rListing = listing;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.updateListing = function(req, res, next) {
    var updateListing = req.rListing;
    if (req.user._id != updateListing.userID) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to update listing.');
    } else {
        var updates = req.body;
        // Only these updates are allowed
        if (updates.condition) updateListing.condition = updates.condition;
        if (updates.sellingPrice) updateListing.sellingPrice = updates.sellingPrice;
        if (updates.rentingPrice) updateListing.rentingPrice = updates.rentingPrice;

        updateListing.save(function(err, listing) {
            if (!err) {
                req.rListing = listing;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
};

exports.removeListing = function(req, res, next) {
    var listing = req.rListing;
    if (req.user._id != listing.userID) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to delete listing.');
    } else {
        Listing.remove({_id: listing._id}, function(err) {
            if (!err) {
                res.status(200).send("Listing deleted.");
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
};