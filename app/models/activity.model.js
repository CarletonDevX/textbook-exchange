var Schema = require('mongoose').Schema;

var Activity = new Schema({
        userID: { type: String, required: true },
        ISBN: { type: String, required: true},
        verb: { type: String, required: true, enum: ['list', 'exchange'] },
        created: { type: Date, default: Date.now() },
        listingID: { type: String, required: true },
        valid: { type: Boolean, default: true },
    },{ capped: { max: 100} });

module.exports = Activity;