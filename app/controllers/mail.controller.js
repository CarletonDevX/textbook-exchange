// For sending mail.
var config = require('../config/config'),
    fs = require('fs'),
    HTBError = require('../errors').HTBError,
    mailer = require('../config/mailgun');

exports.sendTestEmail = function (req, res, next) {
    var options = {
        subject: 'Hits The Books Test',
        html: readEmail('test.html').format('HELLO'),
        user: { email: config.reportEmail, emailSettings: {}},
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendUpdateEmail = function (req, res, next) {
    if (!(req.body.password && req.body.subject && req.body.text)) return next(new HTBError(400, 'Must include "password", "subject", and "text" attributes.'));
    if (req.body.password != config.emailPassword) return next(new HTBError(401, 'Not authorized to send email.'));
    var options = {
        subject: req.body.subject,
        html: req.body.text,
        users: req.rUsers,
        setting: 'updates',
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendRegistrationEmail = function (req, res, next) {
    var user = req.rUser;
    var url = config.url; // req.subdomain + '.' + config.url
    var options = {
        subject: 'Complete your Hits The Books registration',
        html: readEmail('registration.html').format(user.name.givenName, url, user._id, user.verifier),
        user: user,
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendRequestPasswordEmail = function (req, res, next) {
    var user = req.rUser;
    var url = config.url;
    var options = {
        subject: 'Confirm password reset',
        html: readEmail('requestPassword.html').format(url, user._id, user.verifier),
        user: user,
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendNewPasswordEmail = function (req, res, next) {
    var user = req.rUser;
    var password = req.rPassword;
    var url = config.url;
    var options = {
        subject: 'Your password has been reset',
        html: readEmail('newPassword.html').format(password, url),
        user: user,
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendOfferEmail = function (req, res, next) {
    var listing = req.rListings[0];
    var book = listing.book;
    var lister = listing.user;
    var offerer = req.rUser;
    var url = config.url;
    var message = req.rOffer.message || '<No message>';
    var options = {
        subject: 'Someone has made an offer on your book ' + book.name,
        'h:Reply-To': offerer.email,
        html: readEmail('offer.html').format(offerer.name.fullName, book.name, offerer.name.givenName, message, url),
        user: lister,
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendSubscribersEmail = function (req, res, next) {
    var book = req.rBook;
    var subscribers = [];
    var url = config.url;
    // Remove current user from list of subscribers if necessary
    for (var i = 0; i < req.rUsers.length; i++) {
        if (req.rUsers[i]._id.toString() != req.user._id.toString()) subscribers.push(req.rUsers[i]);
    }
    var options = {
        subject: 'Someone has posted a listing for a book on your watchlist.',
        html: readEmail('watchlist.html').format(book.name, url, book.ISBN),
        users: subscribers,
        setting: 'watchlist',
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendUndercutEmail = function (req, res, next) {
    var book = req.rBook;
    var users = req.rUsers;
    var url = config.url;
    var options = {
        subject: 'Someone has undercut your price for ' + book.name,
        html: readEmail('undercut.html').format(book.name, url, book.ISBN),
        users: users,
        setting: 'undercut',
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

exports.sendReportEmail = function (req, res, next) {
    var error = req.body;
    if (!error.message) return next(new HTBError(400, 'Must include "message" attribute.'));
    var options = {
        subject: 'HTB Error Report',
        html: readEmail('report.html').format(error.message),
        user: { email: config.reportEmail, emailSettings: {}},
    };
    mailer.send(options, function (err) {
        next(err);
    });
};

/* HELPERS */

var readEmail = function (file) {
    var body = String(fs.readFileSync(__dirname + '/../emails/' + file, 'utf8'));
    var header = '<style>' + String(fs.readFileSync(__dirname + '/../emails/emails.css', 'utf8')) + '</style>';
    return header + body;
};

// Basic string formatting function for templates (http://stackoverflow.com/a/4673436)
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
