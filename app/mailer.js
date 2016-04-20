// For sending mail.
var sender = require('./config/nodemailer'),
	User = require('mongoose').model('users'),
    Error = require('./errors'),
    fs = require('fs'),
    config = require('./config/config')();

var readEmail = function (file) {
	return String(fs.readFileSync(__dirname + "/emails/" + file, "utf8"));
}

// Basic string formatting function for templates (http://stackoverflow.com/a/4673436)
if (!String.prototype.format) {
  String.prototype.format = function() {
  	var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
    	return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

exports.sendTestEmail = function (req, res, next) {
	options = {
		subject: "Hits The Books Test",
		html: readEmail("test.html").format("HELLO"),
		user: { email: "pickartd@carleton.edu", emailSettings: {}}
	}
	sendMail(req, res, next, options);
}

exports.sendUpdateEmail = function (req, res, next) {
	if (!(req.body.password && req.body.subject && req.body.text)) {
		Error.errorWithStatus(req, res, 400, 'Must provide "password", "subject", and "text" attributes.');
		return;
	}
	if (req.body.password == config.emailPassword) {
		options = {
			subject: req.body.subject,
			html: req.body.text,
			users: req.rUsers,
			setting: "updates"
		}
		sendMailToMultipleRecipients(req, res, next, options);
	} else {
		Error.errorWithStatus(req, res, 401, 'Not authorized to send email.');
	}
}

exports.sendRegistrationEmail = function (req, res, next) {
	var user = req.rUser;
	
	options = {
		subject: "Complete your Hits The Books registration",
		html: readEmail("registration.html").format(user.verifier),
		user: user
	}
	sendMail(req, res, next, options);
}

exports.sendOfferEmail = function (req, res, next) {
	var listing = req.rListings[0];
	var book = listing.book;
	var lister = listing.user;
	var offerer = req.rUser;
	var message = req.body.message;
	if (message) {
		message = "<br>--<br>" + offerer.name.givenName + " has included the following message:<br>" + message;
	} else {
		message = "";
	}

	options = {
		subject: "Someone has made an offer on your book " + book.name,
		html: readEmail("offer.html").format(offerer.name.fullName, book.name, offerer.email, message),
		user: lister
	}
	sendMail(req, res, next, options);
}

exports.sendSubscribersEmail = function (req, res, next) {
	var listing = req.rListings[0];
	var book = req.rBook;
	var subscribers = [];

	// Remove current user from list of subscribers if necessary
	for (var i = 0; i < req.rSubscribers.length; i++) {
		if (req.rSubscribers[i]._id.toString() != req.user._id.toString()) {
			subscribers.push(req.rSubscribers[i]);
		}
	};

	console.log(subscribers);

	options = {
		subject: "Someone has posted a listing for a book on your watchlist.",
		html: readEmail("watchlist.html").format(book.name, listing._id),
		users: subscribers,
		setting: "watchlist" 
	}
	sendMailToMultipleRecipients(req, res, next, options);
}

exports.sendUndercutEmail = function (req, res, next) {
	var listing = req.rListings[0];
	var book = req.rBook;
	var users = req.rUndercutUsers;

	options = {
		subject: "Someone has undercut your price for " + book.name,
		html: readEmail("undercut.html").format(book.name, listing._id),
		users: users,
		setting: "undercut" 
	}
	sendMailToMultipleRecipients(req, res, next, options);
}

/* SENDING HELPERS */

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
	if (config.mailEnabled && options.user.emailSettings[options.setting] != false) {

		options.to = options.user.email;
	    sender.sendMail(options, function (err) {
	        if (!err) {
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
		if (options.callback) {
			options.callback(req, res, next, options);
		} else {
			next();
		}
	}
}