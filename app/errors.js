exports.sendHTBErrors = function (err, req, res, next) {
    if (err.status && err.message) {
        // This means it's a nice HTBError
        res.status(err.status);
        return res.send(err.message);
    }
    next(err);
};

exports.endOfWorld = function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Sorry, something went wrong. Please try again.');
};

exports.send404 = function (req, res, next) {
    res.status(404);
    if (req.accepts('json')) return res.send('Not found');
    res.type('txt').send('Not found');
};

exports.api404 = function (req, res, next) {
    res.status(404);
    if (req.accepts('json')) return res.send({ errors: ['API call does not exist'] });
    res.type('txt').send('API call does not exist');
};

exports.mongoError = function (req, res, err) {
    res.status(400);
    var messages = ["Mongo Error", "Dear developer, this method is deprecated, use next(HTBError) instead."];
    for (var name in err.errors) {
        messages.push(err.errors[name].message);
    }
    if (err.message) messages.push(err.message);
    res.json({errors: messages});
}

exports.errorWithStatus = function (req, res, status, message) {
    res.status(status);
    var messages = ["Dear developer, this method is deprecated, use next(HTBError) instead."];
    if (message) messages.push(message);
    res.json({errors: messages});
}

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
