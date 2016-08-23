var Schema = require('mongoose').Schema;

var Subscription = new Schema({
    userID: { type: String, required: true },
    ISBN: { type: String, required: true },
    created: { type: Date, default: new Date() },
});

module.exports = Subscription;