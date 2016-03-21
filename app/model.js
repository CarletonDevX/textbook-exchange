var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

/**** 
Books 
****/

var BookSchema = new Schema({
    ISBN: { type: String, unique: true, index: true },
    name: { type: String, index: true },
    coverImage: String,
    author: [],
    edition: String,
    pageCount: Number,
    publishDate: String,
    publisher: String,
    description: String,
    subscribers: [],
    amazonInfo: {
        id: { type: String, required: true },
        url: { type: String, required: true },
        lastUpdated: { type: Date, required: true },
        numNew: { type: Number, required: true },
        numUsed: { type: Number, required: true },
        sellingPrice: { type: Number, required: true }
    },
    lastSearched: Date
});

BookSchema.index({ 
    name: 'text', 
    description: 'text'
});

// Add schema to db
mongoose.model('books', BookSchema, 'books');

/**** 
Users 
****/

// Reports
var reportSchema = new Schema({
    userID: { type: String, required: true },
    reporterID: { type: String, required: true },
    description: { type: String, required: true },
    created: { type: Date, required: true }
});

// Add schema to db
mongoose.model('reports', reportSchema, 'reports');

var UserSchema = new Schema({
    name: {
        givenName: String,
        familyName: String,
        fullName: String
    },
    email: { type: String, unique: true, required: true },
    emailSettings: {
        watchlist: { type: Boolean, default: true, required: true },
        undercut: { type: Boolean, default: false, required: true },
        updates: { type: Boolean, default: true, required: true }
    },
    verifier: String,
    verified: { type: Boolean, default: true },
    password: { type: String, required: true },
    provider: String,
    providerId: String,
    providerData: {},
    subscriptions: [],
    bio: String,
    avatar: { type: String, default: "https://d30y9cdsu7xlg0.cloudfront.net/png/5020-200.png" },
    gradYear: Number,
    reports: [reportSchema],
    created: { type: Date, required: true }
});

// Compare input password to user password
UserSchema.methods.authenticate = function(password) {

    var md5 = crypto.createHash('md5');
    md5 = md5.update(password).digest('hex');

    return this.password === md5;
};

// Add schema to db
mongoose.model('users', UserSchema, 'users');

/*******
Listings 
*******/

var ListingSchema = new Schema({
    userID: { type: String, required: true },
    ISBN: { type: String, required: true }, //which is the book id
    condition: { type: Number, required: true },
    sellingPrice: { type: Number },
    rentingPrice: { type: Number },
    created: { type: Date, required: true },
    completed: Boolean
});

var validatePrice = function (value) {
    // Integer?
    if(value % 1 === 0) {
        if (0 <= value && value <= 100) {
            return true;
        }
    }
    return false;
}

var validateCondition = function (value) {
    // Integer?
    if(value % 1 === 0) {
        if (0 <= value && value <= 3) {
            return true;
        }
    }
    return false;
}

ListingSchema.path('sellingPrice').validate(validatePrice, "'sellingPrice' must be an integer between 0-100");
ListingSchema.path('rentingPrice').validate(validatePrice, "'rentingPrice' must be an integer between 0-100");

ListingSchema.path('condition').validate(validateCondition, "'condition' must be be an integer between 0-3");

// Add schema to db
mongoose.model('listings', ListingSchema, 'listings');

/***********
Transactions 
***********/

var OfferSchema = new Schema({
    listingID: String,
    buyerID: String,
    sellerID: String,
    ISBN: String,
    date: Date
});

// Add schema to db
mongoose.model('offers', OfferSchema, 'offers');


/***********
School Info 
***********/

var SchoolInfoSchema = new Schema({
    // Name, logo?
});

// Add schema to db
mongoose.model('schoolInfo', SchoolInfoSchema, 'schoolInfo');