var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Activity = require('mongoose').model('activities');

exports.pushActivity = function (req, res, next) {
    var newActivity = new Activity(req.rActivity);
    newActivity.when = new Date();

    console.log('newActivity', newActivity);

    newActivity.save(function (err, activity) {
        if (err) return next(new MongoError(err));
        req.activity = activity;
        console.log('saved activity', activity);
        return next();
    });
};

exports.getActivities = function (req, res, next) {
    Activity.find({}, function (err, activities) {
        if (err) return next(new MongoError(err));
        if (activities.length == 0) return next(new HTBError(404, 'HTB hasn\'t gotten any action yet.'));
        req.rActivities = activities;
        return next();
    });
};
    