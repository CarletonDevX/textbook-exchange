var mongoose = require('mongoose');

var Activity = require('./activity.model'),
	Book = require('./book.model'),
    Listing = require('./listing.model'),
    Offer = require('./offer.model'),
    Report = require('./report.model'),
    School = require('./school.model'),
    User = require('./user.model');

// Register
mongoose.model('books', Book, 'books');
mongoose.model('listings', Listing, 'listings');
mongoose.model('offers', Offer, 'offers');
mongoose.model('reports', Report, 'reports');
mongoose.model('school', School, 'school');
mongoose.model('users', User, 'users');
mongoose.model('activities', Activity, 'activities');
