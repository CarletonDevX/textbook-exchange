exports.lowerCaseEmail = function(req, res, next) {
  if (req.body.username) {
    req.body.username = req.body.username.toLowerCase();
  }
  next();
}
