exports.sendHTBErrors = function (err, req, res, next) {
    if (err.status && err.message) {
        // This means it's a nice HTBError
        if (err.status == 500) console.log(err.stack);
        res.status(err.status);
        return res.send(err.message);
    }
    console.log(err);
    next(err);
};

/* eslint no-unused-vars: "off" */
exports.endOfWorld = function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Sorry, something went wrong. Please try again.');
};

exports.api404 = function (req, res) {
    res.status(404).send('API call does not exist.');
};

exports.send404 = function (req, res) {
    res.status(404).send('Not found.');
};

var HTBError = function (status, message, stack) {
    this.status = status;
    this.message = message;
    this.stack = stack || 'No stack trace.';
};

exports.HTBError = HTBError;

exports.MongoError = function (err) {
    var code = 500;
    if (err.name == 'ValidationError') code = 422;
    return new HTBError(code, 'Mongo error: ' + String(err), err.stack);
};

exports.AmazonError = function (err) {
    return new HTBError(500, 'Amazon error: ' + String(err), err.stack);
};
