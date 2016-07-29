exports.sendHTBErrors = function (err, req, res, next) {
    if (err.status && err.message) {
        // This means it's a nice HTBError
        res.status(err.status);
        console.log(err);
        return res.send(err.message);
    }
    console.log(err);
    next(err);
};

exports.endOfWorld = function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Sorry, something went wrong. Please try again.');
};

exports.api404 = function (req, res, next) {
    res.status(404).send('API call does not exist.');
};

exports.send404 = function (req, res, next) {
    res.status(404).send('Not found.');
};

exports.HTBError = function (status, message) {
    this.status = status;
    this.message = message;
}

exports.MongoError = function (err) {
    return new HTBError(500, "Mongo error: " + err.message);
}

exports.AmazonError = function (err) {
    return new HTBError(500, "Amazon error: " +err.message);
}
