var mailer = require('nodemailer'),
	config = require('./config');

var transport = mailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: config.emailID,
        pass: config.emailPassword
    }
});

module.exports = transport;