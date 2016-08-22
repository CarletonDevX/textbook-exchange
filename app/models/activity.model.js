var Schema = require('mongoose').Schema;

var Activity = new Schema({
        userID: { type: String, required: true },
        ISBN: { type: String, required: true},
        verb: { type: String, required: true, enum: ['list', 'exchange'] },
        created: { type: Date, default: Date.now() },
    },{ capped: { size: 5242880, max: 100} });

module.exports = Activity;