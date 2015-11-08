// For sending mail.
var sender = require('./config/nodemailer'),
	User = require('mongoose').model('users'),
    Error = require('./errors'),
    config = require('./config/config')();

exports.sendRegistrationEmail = function (req, res, next) {
	var user = req.rUser;

	options = {
		to : user.email,
		subject : "Complete your registration to hitsTheBooks",
		html : "Hello, <br> Complete your registration by making a fun API call! Your verifier is" + user.verifier
	}

	sendMail(req, res, next, options);
}

exports.sendOfferEmail = function (req, res, next) {
	var listing = req.rListing;
	var book = listing.book;
	var lister = listing.user;
	var offerer = req.rUser;

	options = {
		subject: "Someone has made an offer on your book " + book.name,
		html: "Hello, <br> " + offerer.name.fullName + " has made an offer on your book " + book.name + ". Email them back at " + offerer.email + " to discuss this offer.",
		user: lister
	}

	sendMail(req, res, next, options);
}

exports.sendSubscribersEmail = function (req, res, next) {
	var listing = req.rListing;
	var book = req.rBook;
	var subscribers = req.rSubscribers;
	var recipients = []
	for (var i = 0; i < subscribers.length; i++) {
		recipients.push(subscribers[i]);
	};
	options = {
		subject: "Someone has posted a listing for a book on your watchlist.",
		html: "Hello, <br> Someone has posted a listing for " + book.name + ". The listing ID is " + listing._id,
		users: recipients,
		setting: "watchlist" 
	}

	sendMailToMultipleRecipients(req, res, next, options);
}

var sendMailToMultipleRecipients = function (req, res, next, options) {
	var users = options.users;
	if (users.length == 0) {
		next();
	} else {
		var sendOptions = options;
		sendOptions.user = users.pop();
		sendOptions.users = users;
		sendOptions.callback = sendMailToMultipleRecipients
		sendMail(req, res, next, sendOptions);
	}
}

var sendMail = function (req, res, next, options) {
	if (config.mailEnabled && user.emailSettings[options.setting]) {
		options.to = user.email;
	    sender.sendMail(options, function(err) {
	        if(!err){
				if (options.callback) {
					options.callback(req, res, next, options);
				} else {
					next();
				}
	        } else {
		        Error.errorWithStatus(req, res, 500, 'A required email did not send.');
	        }
	    });
	} else {
		next();
	}
}