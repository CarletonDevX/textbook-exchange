var Offer = require('mongoose').model('offers'),
    Error = require('../errors');

exports.countOffers = function (req, res, next) {
    if (!req.rSchoolStats) req.rSchoolStats = {};
    Offer.count({"completed": true}, function (err, count) {
        if (!err) {
            req.rSchoolStats.numOffers = count;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getOffer = function (req, res, next) {
    var offerID = req.params.offerID;
    Offer.findOne({_id: offerID}, function(err, offer) {
        if (!err) {
            if (!offer) {
                Error.errorWithStatus(req, res, 404, 'Offer not found by those conditions.');
            } else {
                req.rOffer = offer;
                // If you want to get the listing later
                req.rListingID = offer.listingID;
                next();
            }
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.getOffersForListing = function (req, res, next) {
    var listing = req.rListing;
    Offer.find({listingID: listing._id}, function (err, offers) {
        if (!err) {
            req.rOffers = offers;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
}

exports.makeOffer = function (req, res, next) {
    var listing = req.rListing;
    var user = req.rUser;
    var offers = req.rOffers;
    for (var i = 0; i < offers.length; i++) {
        if (offers[i].buyerID == user._id) {
            Error.errorWithStatus(req, res, 400, "User has already made an offer on this listing. ID:" + offers[i]._id);
            return;
        }
    };
    if (user._id == listing.userID) {
        Error.errorWithStatus(req, res, 400, "You can't make an offer on your own listing.");
        return;
    }
    var newOffer = new Offer({
        listingID: listing._id,
        buyerID: user._id,
        sellerID: listing.userID,
        ISBN: listing.ISBN,
        date: new Date(),
        completed: false
    });
    newOffer.save(function(err, offer) {
        if (!err) {
            req.rOffer = offer;
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    });
} 

exports.removeOffers = function (req, res, next) {
    var offers = req.rOffers;
    var offerIDs = [];
    for (var i = 0; i < offers.length; i++) {
        offerIDs.push(offers[i]._id);
    };
    Offer.remove({_id: {$in: offerIDs}}, function (err) {
        if (!err) {
            next();
        } else {
            Error.mongoError(req, res, err);
        }
    })
}

exports.completeOffer = function (req, res, next) {
    var offer = req.rOffer;
    var user = req.rUser;
    if (offer.sellerID != user._id) {
        Error.errorWithStatus(req, res, 401, 'Unauthorized to complete offer.');
    } else {
        offer.completed = true;
        offer.save(function(err, offer) {
            if (!err) {
                req.rOffer = offer;
                next();
            } else {
                Error.mongoError(req, res, err);
            }
        });
    }
}




