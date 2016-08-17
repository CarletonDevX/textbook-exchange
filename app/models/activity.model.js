var Schema = require('mongoose').Schema;

var Activity = new Schema({
        userID: { type: String, required: true },
        ISBN: { type: String, required: true},
        verb: { type: String, required: true, enum: ['list', 'exchange'] },
        when: Date,
    },{ capped: { size: 1024, max: 5} });

module.exports = Activity;