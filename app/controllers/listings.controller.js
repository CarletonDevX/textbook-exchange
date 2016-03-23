var Listing = require('mongoose').model('listings'),
    Error = require('../errors');

exports.countListings = function (req, res, next) {
    if (!req.rSchoolStats) req.rSchoolStats = {};
    Listing.count({completed: false}, function (err, count) {
        if (!err) {
            req.rSchoolStats.numListings = count;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getUserListings = function (req, res, next) {
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

exports.getBookListings = function (req, res, next) {
    var ISBN = req.rBook.ISBN;
    Listing.find({completed: false, ISBN: ISBN}).lean().exec(function(err, listings) {
        if (!err) {
            req.rListings = listings;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.getUndercutListings = function (req, res, next) {
    var ISBN = req.rBook.ISBN;
    var listing = req.rListings[0];

    // Get listings with prices higher than the new listing
    var orClause = []
    if (listing.rentingPrice) {
        orClause.push({"rentingPrice": {$gt: listing.rentingPrice}});
    }
    if (listing.sellingPrice) {
        orClause.push({"sellingPrice": {$gt: listing.sellingPrice}});
    }
    Listing.find({completed: false, ISBN: ISBN, $or: orClause}).lean().exec(function(err, listings) {
        if (!err) {
            req.rUndercutListings = listings;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.getListing = function (req, res, next) {
    // Get ID from either params or previous middleware
    var listingID = req.rListingID || req.params.listingID;

    Listing.findOne({_id: listingID}, function(err, listing) {
        if (!err) {
            if (!listing) {
                Error.errorWithStatus(req, res, 404, 'Listing not found by those conditions.');
            } else {
                req.rListings = [listing];
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.createListing = function (req, res, next) {
    var userListings = req.rListings;
    for (var i = 0; i < userListings.length; i++) {
        if (userListings[i].ISBN == req.rBook.ISBN) {
            Error.errorWithStatus(req, res, 400, 'User already has a listing for this book. ID: ' + userListings[i]._id);
            return;
        }
    }

    var newListing = new Listing(req.body);
    if (newListing.sellingPrice == null && newListing.rentingPrice == null) {
        Error.errorWithStatus(req, res, 400, 'Must include "sellingPrice" and/or "rentingPrice" attribute(s).');
        return;
    }

    newListing.userID = req.user._id;
    newListing.ISBN = req.rBook.ISBN;
    newListing.created = new Date();
    newListing.completed = false;

    newListing.save(function(err, listing) {
        if (!err) {
            req.rListings = [listing];
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.updateListing = function (req, res, next) {
    var listing = req.rListings[0];
    if (req.user._id != listing.userID) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to update listing.');
    } else {
        var updates = req.body;

        // Only updates to condition, sellingPrice and rentingPrice are allowed
        if (updates.condition != null) listing.condition = updates.condition;

        // Add null values for prices if value is < 0
        if (updates.sellingPrice) {
            if (updates.sellingPrice < 0) {
                listing.sellingPrice = null;
            } else {
                listing.sellingPrice = updates.sellingPrice;
            }
        }
        if (updates.rentingPrice) {
            if (updates.rentingPrice < 0) {
                listing.rentingPrice = null;
            } else {
                listing.rentingPrice = updates.rentingPrice;
            }
        }

        if (listing.sellingPrice == null && listing.rentingPrice == null) {
            Error.errorWithStatus(req, res, 400, 'Listing must have a "sellingPrice" or "rentingPrice".');
            return;
        }

        listing.save(function(err, listing) {
            if (!err) {
                req.rListings = [listing];
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
};

exports.removeListings = function (req, res, next) {
    var listings = req.rListings;
    var listingIDs = [];
    for (var i = 0; i < listings.length; i++) {
        var listing = listings[i];
        if (req.user._id != listing.userID) {
            Error.errorWithStatus(req, res, 401, 'Unauthorized to delete listing.');
            return;
        }
        listingIDs.push(listing._id);
    };
    Listing.remove({_id: {$in: listingIDs}}, function(err) {
        if (!err) {
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
};

exports.makeOffer = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    listing.offeredUsers.push(user._id);

    listing.save(function(err, listing) {
        if (!err) {
            req.rListings = [listing];
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.completeListing = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    if (listing.userID != user._id) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to complete listing.');
    } else {
        listing.completed = true;
        listing.save(function(err, listing) {
            if (!err) {
                req.rListings = [listing];
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
}