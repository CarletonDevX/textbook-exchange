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
                    console.log(listings[0].user.avatar);
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
}