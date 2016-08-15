var Schema = require('mongoose').Schema;

var Listing = new Schema({
    userID: { type: String, required: true },
    ISBN: { type: String, required: true }, // which is the book id
    condition: { type: Number, required: true },
    sellingPrice: { type: Number },
    rentingPrice: { type: Number },
    created: { type: Date, default: new Date() },
    completed: Boolean,
});

// Validation

var validatePrice = function (value) {
    // Integer?
    if (value % 1 === 0) {
        if (0 <= value && value <= 250) {
            return true;
        }
    }
    return false;
};

var validateCondition = function (value) {
    // Integer?
    if (value % 1 === 0) {
        if (0 <= value && value <= 3) {
            return true;
        }
    }
    return false;
};

Listing.path('sellingPrice').validate(validatePrice, '"sellingPrice" must be an integer between 0-250');
Listing.path('rentingPrice').validate(validatePrice, '"rentingPrice" must be an integer between 0-250');
Listing.path('condition').validate(validateCondition, '"condition" must be be an integer between 0-3');

module.exports = Listing;