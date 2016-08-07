var Schema = require('mongoose').Schema;

var Offer = new Schema({
    listingID: String,
    buyerID: String,
    sellerID: String,
    ISBN: String,
    date: Date,
});

module.exports = Offer;
