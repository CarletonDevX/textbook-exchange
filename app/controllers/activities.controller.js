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
    var activity = new Activity({
        userID: user._id,
        ISBN: book.ISBN,
        verb: 'list'
    });
    activity.save(function (err, activity) {
        if (err) return next(new MongoError(err));
        req.rActivity = activity;
        return next();
    });
}

exports.getActivities = function (req, res, next) {
    Activity.find({}, function (err, activities) {
        if (err) return next(new MongoError(err));
        if (activities.length == 0) return next(new HTBError(404, 'No activities found.'));
        var limit = Number(req.query.limit);
        if (limit && activities.length > limit) activities = activities.slice(0, limit);
        req.rActivities = activities;
        return next();
    });
};
    