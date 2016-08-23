var HTBError = require('../errors').HTBError,
    MongoError = require('../errors').MongoError,
    Report = require('mongoose').model('reports');

exports.create = function (req, res, next) {
  var user = req.rUser;
  var description = req.body.description;
  if (!description) return next(new HTBError(400, 'Must include "description" attribute.'));
  var report = new Report({
    userID: user._id,
    reporterID: req.user._id,
    description: description,
  });
  report.save(function (err) {
      if (err) return next(new MongoError(err));
      return next();
  });
}