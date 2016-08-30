var Schema = require('mongoose').Schema;

var Offer = new Schema({
    listingID: { type: String, required: true },
    buyerID: { type: String, required: true },
    sellerID: { type: String, required: true },
    message: String,
    ISBN: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = Offer;
