var Offer = require('mongoose').model('offers'),
    Error = require('../errors');

exports.makeOffer = function (req, res, next) {
    var listing = req.rListing;
    var user = req.rUser;
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