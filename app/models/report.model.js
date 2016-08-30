var Schema = require('mongoose').Schema;

var Report = new Schema({
    userID: { type: String, required: true },
    reporterID: { type: String, required: true },
    description: { type: String, required: true },
    created: { type: Date, default: Date.now },
});

module.exports = Report;