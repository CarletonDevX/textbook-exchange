var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Activity = require('mongoose').model('activities');

exports.createExchangeActivity = function (req, res, next) {
    var user = req.rUser;
    var listing = req.rListings[0];
    var activity = new Activity({
        userID: user._id,
        ISBN: listing.ISBN,
        verb: 'exchange'
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
        listing: listing._id,
    });
    activity.save(function (err, activity) {
        if (err) return next(new MongoError(err));
        req.rActivity = activity;
        return next();
    });
}

exports.removeListActivity = function(req, res, next) {
    console.log('req',req.rListingID);
    Activity.find({listing: req.rListingID}, function(err, listing){
        console.log(listing);
    });
}

exports.getActivities = function (req, res, next) {
    var limit = Number(req.query.limit) || 100;
    Activity.find({}).limit(limit).exec(function (err, activities) {
        if (err) return next(new MongoError(err));
        if (activities.length == 0) return next(new HTBError(404, 'No activities found.'));
        req.rActivities = activities;
        return next();
    });
};
    