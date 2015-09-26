// For sending mail.
var sender = require('./config/nodemailer'),
	User = require('mongoose').model('users'),
    Error = require('./errors');

exports.sendOfferEmail = function (req, res, next) {
	var listing = req.rListings[0];
	var book = listing.book;
	var user = req.rUser;
	// Get lister email
	User.findOne({_id: listing.userID}, function (err, lister) {
		if (!err) {
			options = {
				to : lister.email,
				subject : "Someone has made an offer on your book " + book.name,
				html : "Hello, <br> " + user.name.fullName + " has made an offer on your book." 
			}
			sendMail(req, res, next, options)
		} else {
            Error.mongoError(req, res, err);
		}
	});
}

var sendMail = function (req, res, next, options) {
    sender.sendMail(options, function(err) {
        if(!err){
            next();
        } else {
        	console.log(err);
	        Error.errorWithStatus(req, res, 500, 'A required email did not send.');
        }
    });
}