var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users');

exports.getBook = function(req, res, next) {
    var ISBN = req.params.ISBN;
    Book.findOne({ISBN: ISBN}, function(err, book) {
        if (!err) {
            if (!book) {
                res.status(404).send('Book not found by those conditions.');
            } else {
                req.rBook = book;
                next();
            }
        } else {
            res.json(err);
        }
    });
};

exports.search = function(req, res, next) {
    var query = req.query.query;
    if (query == 'undefined') query = '';
    //TODO: Implement a more general search function
    // Right now, we assume we've got the first digits of an ISBN
    var regex = new RegExp("^" + query + "[0-9]*");
    Book.find({ ISBN: regex}, function(err, results) {
        if (!err) {
            res.json(results);
        } else {
            res.json(err);
        }
    });
};