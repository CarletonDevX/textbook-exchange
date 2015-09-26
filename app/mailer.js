// For sending mail.
var sender = require('./config/nodemailer'),
	User = require('mongoose').model('users'),
    Error = require('./errors');

exports.sendOfferEmail = function (req, res, next) {
	var listing = req.rListing;
	var book = listing.book;
	var lister = listing.user;
	var offerer = req.rUser;

	options = {
		to : lister.email,
		subject : "Someone has made an offer on your book " + book.name,
		html : "Hello, <br> " + offerer.name.fullName + " has made an offer on your book " + book.name + ". Email them back at " + offerer.email + " to discuss this offer." 
	}

	sendMail(req, res, next, options);
}

var sendMail = function (req, res, next, options) {
    sender.sendMail(options, function(err) {
        if(!err){
            next();
        } else {
	        Error.errorWithStatus(req, res, 500, 'A required email did not send.');
        }
    });
}