var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Offer = require('mongoose').model('offers');

exports.getOffer = function (req, res, next) {
    var offerID = req.params.offerID;
    Offer.findOne({_id: offerID}, function (err, offer) {
        if (err) return next(new MongoError(err));
        if (!offer) return next(new HTBError(404, 'Offer not found by those conditions.'));
        req.rOffer = offer;
        // If you want to get the listing later
        req.rListingID = offer.listingID;
        next();
    });
};

exports.getUserOfferForListing = function (req, res, next) {
    var listing = req.rListings[0];
    var user = req.rUser;
    Offer.findOne({listingID: listing._id, buyerID: user._id}, function (err, offer) {
        if (err) return next(new MongoError(err));
        if (!offer) return next(new HTBError(404, 'User hasn\'t made an offer on this listing.'));
        req.rOffer = offer;
        next();
    });
};

exports.getOffersForListings = function (req, res, next) {
    var listings = req.rListings;
    if (listings.length == 0) {
        req.rOffers = [];
        return next();
    }
    var listingIDs = [];
    for (var i = 0; i < listings.length; i++) {
        listingIDs.push(listings[i]._id);
    }
    Offer.find({listingID: {$in: listingIDs}}, function (err, offers) {
        if (err) return next(new MongoError(err));
        req.rOffers = offers;
        return next();
    });
};

exports.getOffersForUser = function (req, res, next) {
    var user = req.rUser;
    Offer.find({buyerID: user._id}, function (err, offers) {
        if (err) return next(new MongoError(err));
        req.rOffers = offers;
        return next();
    });
};

exports.create = function (req, res, next) {
    var listing = req.rListings[0];
    var user = req.rUser;
    if (user._id == listing.userID) return next(new HTBError(400, 'You can\'t make an offer on your own listing.'));
    // Check for duplicates
    Offer.findOne({listingID: listing._id, buyerID: user._id}, function (err, offer) {
        if (err) return next(new MongoError(err));
        if (offer) return next(new HTBError(400, 'User has already made an offer on this listing.'));
        var newOffer = new Offer({
            listingID: listing._id,
            buyerID: user._id,
            sellerID: listing.userID,
            ISBN: listing.ISBN,
            date: new Date(),
            message: req.body.message,
        });
        newOffer.save(function (err, offer) {
            if (err) return next(new MongoError(err));
            req.rOffer = offer;
            return next();
        });
    });

}; 

exports.removeOffers = function (req, res, next) {
    var offers = req.rOffers;
    if (offers.length == 0) return next();
    var offerIDs = [];
    for (var i = 0; i < offers.length; i++) {
        offerIDs.push(offers[i]._id);
    }
    Offer.remove({_id: {$in: offerIDs}}, function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
};

