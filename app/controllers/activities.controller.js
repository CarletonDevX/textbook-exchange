var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Activity = require('mongoose').model('activities');

exports.createExchangeActivity = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    var activity = new Activity({
        userID: user._id,
        ISBN: listing.ISBN,
        verb: 'exchange',
        listingID: listing._id,
    });
    activity.save(function (err, activity) {
        if (err) return next(new MongoError(err));
        req.rActivity = activity;
        return next();
    });
}

exports.createListActivity = function (req, res, next) {
    var user = req.rUser;
    var book = req.rBook;
    var listing = req.rListings[0]
    var activity = new Activity({
        userID: user._id,
        ISBN: book.ISBN,
        verb: 'list',
        listingID: listing._id,
    });
    activity.save(function (err, activity) {
        if (err) return next(new MongoError(err));
        req.rActivity = activity;
        return next();
    });
}

exports.removeActivitiesForListings = function (req, res, next) {
    var listings = req.rListings;
    var listingIDs = [];
    for (var i = 0; i < listings.length; i++) {
        listingIDs.push(listings[i]._id);
    }
    if (listingIDs.length == 0) return next();
    // Have to use "valid" boolean because you can't remove from cappped collections
    Activity.update({listingID: {$in: listingIDs}}, {valid: false}, {multi: true}, function (err) {
        if (err) return next(new MongoError(err));
        return next();
    });
}

exports.getActivities = function (req, res, next) {
    var limit = Number(req.query.limit) || 100;
    Activity.find({valid: true}).limit(limit).exec(function (err, activities) {
        if (err) return next(new MongoError(err));
        if (activities.length == 0) return next(new HTBError(404, 'No activities found.'));
        req.rActivities = activities;
        return next();
    });
};
    