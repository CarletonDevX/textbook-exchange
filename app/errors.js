var sendHTBErrors = function (err, req, res, next) {
    if (err.status && err.message) {
        // This means it's a nice HTBError
        res.status(err.status);
        return res.send(err.message);
    }
    next(err);
};

var endOfWorld = function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Sorry, something went wrong. Please try again.');
};

var send404 = function (req, res, next) {
    res.status(404);
    if (req.accepts('json')) return res.send('Not found');
    res.type('txt').send('Not found');
};

var api404 = function (req, res, next) {
    res.status(404);
    if (req.accepts('json')) return res.send({ errors: ['API call does not exist'] });
    res.type('txt').send('API call does not exist');
};

var mongoError = function (req, res, err) {
    res.status(400);
    var messages = ["Mongo Error", "Dear developer, this method is deprecated, use next(HTBError) instead."];
    for (var name in err.errors) {
        messages.push(err.errors[name].message);
    }
    if (err.message) messages.push(err.message);
    res.json({errors: messages});
}

var statusError = function (req, res, status, message) {
    res.status(status);
    var messages = ["Dear developer, this method is deprecated, use next(HTBError) instead."];
    if (message) messages.push(message);
    res.json({errors: messages});
}

var HTBError = function (status, message) {
    this.status = status;
    this.message = message;
}

var MongoError = function (err) {
    return new HTBError(500, "Mongo error: " + err.message);
}

var AmazonError = function (err) {
    return new HTBError(500, "Amazon error: " +err.message);
}

module.exports = {
    sendHTBErrors: sendHTBErrors,
    endOfWorld: endOfWorld,
    send404: send404,
    api404: api404,
    mongoError: mongoError,
    errorWithStatus: statusError,
    HTBError: HTBError,
    MongoError: MongoError,
    AmazonError: AmazonError
}