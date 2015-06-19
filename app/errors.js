// Taken from Matt Cotter, who maybe took it from someone else

var logErrors = function (err, req, res, next) {
  console.error(err.stack);
  next(err);
};

var ajaxErrorHandler = function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'something went wrong' });
  } else {
    next(err);
  }
};

var endOfWorld = function (err, req, res, next) {
  res.status(500).render('errors', {
    status: 500,
    heading: 'Server Error',
    msg: 'Sorry, something went wrong. Please try again.'
  });
};

var send404 = function (req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    return res.status(404).render('error');
  }

  // respond with json
  if (req.accepts('json')) {
    return res.send({ error: 'Not found' });
  }

  // default to plain-text
  res.type('txt').send('Not found');
};

module.exports = {
  logger: logErrors,
  ajax: ajaxErrorHandler,
  endOfWorld: endOfWorld,
  send404: send404
}