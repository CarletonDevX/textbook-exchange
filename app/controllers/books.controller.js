var Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users');

exports.renderBook = function(req, res, next) {
    Book.findOne(req.query, function(err, book) {
        if (!err) {
            if (!book) {
              res.type('txt').send('No book found by those parameters :(');
            } else {
                Listing.find({ISBN: book.ISBN}, function(err, listings) {
                    if (!err) {
                        res.render('book', {
                            'book': book,
                            'listings': listings
                        });
                    } else {
                        res.json(err);
                    }
                });
            }
        } else {
            res.json(err);
        }
    });
};

exports.getBook = function(req, res, next) {
    // path = req.url;
    // isbn = path.substr(path.lastIndexOf('/') + 1);
    isbn = req.params.isbn;
    if (isbn.length < 1) {
        res.status(400).send('Needs ISBN.');
    } else {
        Book.findOne({ISBN: isbn}, function(err, book) {
            if (!err) {
                if (!book) {
                    res.status(404).send('Book not found by those conditions.');
                } else {
                    res.json(book);
                }
            } else {
                res.json(err);
            }
        });
    }
};

exports.search = function(req, res, next) {
    query = req.query.query;
    console.log("query:" + query);
    //right now we just grab all the books
    Book.find({}, function(err, results) {
        if (!err) {
            res.json(results);
        } else {
            res.json(err);
        }
    });
};