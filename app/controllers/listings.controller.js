var Listing = require('mongoose').model('listings'),
    HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError;

exports.countListings = function (req, res, next) {
    if (!req.rSchoolStats) req.rSchoolStats = {};
    Listing.count({completed: false}, function (err, count) {
        if (err) return next(new MongoError(err));
        req.rSchoolStats.numListings = count;
        return next();
    });
}

exports.getUserListings = function (req, res, next) {
    var userID = req.rUser._id;
    Listing.find({completed: false, userID: userID}, function(err, listings) {
        if (err) return next(new MongoError(err));
        req.rListings = listings;
        return next();
    });
};

exports.getBookListings = function (req, res, next) {
    var ISBN = req.rBook.ISBN;
    Listing.find({completed: false, ISBN: ISBN}, function(err, listings) {
        if (err) return next(new MongoError(err));
        req.rListings = listings;
        return next();
    });
};

exports.getUndercutListings = function (req, res, next) {
    var ISBN = req.rBook.ISBN;
    var listing = req.rListings[0];

    // Get listings with prices higher than the new listing
    var orClause = []
    if (listing.rentingPrice != null)  orClause.push({"rentingPrice": {$gt: listing.rentingPrice}});
    if (listing.sellingPrice != null)  orClause.push({"sellingPrice": {$gt: listing.sellingPrice}});

    Listing.find({completed: false, ISBN: ISBN, $or: orClause}, function(err, listings) {
        if (err) return next(new MongoError(err));
        req.rUndercutListings = listings;
        return next();
    });
};

exports.getListing = function (req, res, next) {
    var listingID = req.rListingID || req.params.listingID;
    Listing.findOne({_id: listingID}, function(err, listing) {
        if (err) return next(new MongoError(err));
        if (!listing) return next(new HTBError(404, 'Listing not found by those conditions.'));
        req.rListings = [listing];
        return next();
    });
};

exports.createListing = function (req, res, next) {
    var listings = req.rListings;
    var book = req.rBook;
    for (var i = 0; i < listings.length; i++) {
        if (listings[i].ISBN == book.ISBN) return next(new HTBError(400, 'User already has a listing for this book. ID: ' + userListings[i]._id));
    }
    var newListing = new Listing(req.body);
    if (newListing.sellingPrice == null && newListing.rentingPrice == null) return next(new HTBError(400, 'Must include "sellingPrice" and/or "rentingPrice" attribute(s).'));
    if (newListing.condition == null) return next(new HTBError(400, 'Must include "condition" attribute.'));
    newListing.userID = req.user._id;
    newListing.ISBN = book.ISBN;
    newListing.completed = false;

    newListing.save(function(err, listing) {
        if (err) return next(new MongoError(err));
        req.rListings = [listing];
        return next();
    });
};

exports.updateListing = function (req, res, next) {
    var listing = req.rListings[0];
    var updates = req.body;
    if (req.user._id != listing.userID) return next(new HTBError(401, 'Unauthorized to update listing.'));

    // Only updates to condition, sellingPrice and rentingPrice are allowed
    if (updates.condition != null) listing.condition = updates.condition;
    if (updates.sellingPrice != null) listing.sellingPrice = updates.sellingPrice;
    if (updates.rentingPrice != null) listing.rentingPrice = updates.rentingPrice;
    // Add null values for prices if value is < 0
    if (listing.sellingPrice < 0) listing.sellingPrice = null;
    if (listing.rentingPrice < 0) listing.rentingPrice = null;
    if (listing.sellingPrice == null && listing.rentingPrice == null) return next(new HTBError(400, 'Listing must have a "sellingPrice" or "rentingPrice".'));

    listing.save(function(err, listing) {
        if (err) return next(new MongoError(err));
        req.rListings = [listing];
        return next();
    });
};

exports.removeListings = function (req, res, next) {
    var listings = req.rListings;
    var listingIDs = [];
    for (var i = 0; i < listings.length; i++) {
        if (req.user._id != listings[i].userID) return next(new HTBError(401, 'Unauthorized to delete listing.'));
        listingIDs.push(listings[i]._id);
    };
    if (listingIDs.length == 0) return next();
    Listing.remove({_id: {$in: listingIDs}}, function(err) {
        if (err) return next(new MongoError(err));
        return next();
    });
};

exports.completeListing = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    if (listing.userID != user._id) return next(new HTBError(401, 'Unauthorized to complete listing.'));
    listing.completed = true;
    listing.save(function(err, listing) {
        if (err) return next(new MongoError(err));
        req.rListings = [listing];
        return next();
    });
}