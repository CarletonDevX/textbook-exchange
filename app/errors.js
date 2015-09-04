// Taken from Matt Cotter, who maybe took it from someone else

var logErrors = function (err, req, res, next) {
  console.error(err.stack);
  next(err);
};

var ajaxErrorHandler = function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ errors: ['Something went wrong.'] });
  } else {
    next(err);
  }
};

var endOfWorld = function (err, req, res, next) {
  res.status(500).render('error', {
    status: 500,
    heading: 'Server Error',
    message: 'Sorry, something went wrong. Please try again.'
  });
};

var send404 = function (req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    return res.status(404).render('error', {
      message: "404: we goofed"
    });
  }

  // respond with json
  if (req.accepts('json')) {
    return res.send({ errors: ['Not found'] });
  }

  // default to plain-text
  res.type('txt').send('Not found');
};

var mongoError = function (req, res, err) {
  res.status(400);
  var messages = ["Mongo Error"];
  for (var name in err.errors) {
      messages.push(err.errors[name].message);
  }
  res.json({errors: messages});
}

var statusError = function (req, res, status, message) {
  res.status(status);
  var messages = [];
  if (message) {
    messages.push(message);
  }
  res.json({errors: messages});
}

module.exports = {
  logger: logErrors,
  ajax: ajaxErrorHandler,
  endOfWorld: endOfWorld,
  send404: send404,
  mongoError: mongoError,
  errorWithStatus: statusError
}