var mailgun = require('mailgun-js'),
    config = require('./config')(),
    HTBError = require('../errors').HTBError;

var sender = mailgun(config.mailgun).messages();

var send = function (options, callback) {
    // If there are multiple recipients, grab the first one
    if (options.users && options.users.length) options.user = options.users.pop();
    // If there's no user, we're done (success)
    if (!options.user) return callback(null);
    // If configs say so, skip the email
    if (!config.mailEnabled || options.user.emailSettings[options.setting] == false) return send(options, callback);

    options.to = options.user.email;
    options.from = config.mailgun.from;
    sender.send(options, function (err) {
        if (err) {
            console.log(err.stack); // We probably want to know what's up with these ones
            return callback(new HTBError(500, 'A required email did not send.'));
        }
        delete options.user;
        return send(options, callback);
    });
}

module.exports = {
    send: send
}