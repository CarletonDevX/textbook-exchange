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
    // TODO: test this 
    Offer.findOne({listingID: listing._id, buyerID: user._id}, function (err, offer) {
        if (err) return next(new MongoError(err));
        if (!offer) return next(new HTBError(404, 'User hasn\'t made an offer on this listing.'));
        req.rOffer = offer;
        next();
    });
};

exports.getOffersForListings = function (req, res, next) {
    var listings = req.rListings;
    var listingIDs = [];
    for (var i = 0; i < listings.length; i++) {
        listingIDs.push(listings[i]._id);
    }
    if (listingIDs.length == 0) {
        req.rOffers = [];
        return next();
    }
    Offer.find({listingID: {$in: listingIDs}}, function (err, offers) {
        if (err) return next(new MongoError(err));
        req.rOffers = offers;
        return next();
    });
};

exports.makeOffer = function (req, res, next) {
    var listing = req.rListings[0];
    var user = req.rUser;
    for (var i = 0; i < user.offers.length; i++) {
        if (user.offers[i] == listing._id) return next(new HTBError(400, 'User has already made an offer on this listing.'));
    }
    if (user._id == listing.userID) return next(new HTBError(400, 'You can\'t make an offer on your own listing.'));

    var newOffer = new Offer({
        listingID: listing._id,
        buyerID: user._id,
        sellerID: listing.userID,
        ISBN: listing.ISBN,
        date: new Date(),
        completed: false,
    });
    newOffer.save(function (err, offer) {
        if (err) return next(new MongoError(err));
        req.rOffer = offer;
        return next();
    });
}; 

exports.removeOffers = function (req, res, next) {
    var offers = req.rOffers;
    var offerIDs = [];
    for (var i = 0; i < offers.length; i++) {
        offerIDs.push(offers[i]._id);
    }
    if (offerIDs.length == 0) return next();
    // TODO: should we be checking for ownership here?
    Offer.remove({_id: {$in: offerIDs}}, function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
};

