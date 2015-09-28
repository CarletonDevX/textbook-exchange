var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

/**** 
Books 
****/

var BookSchema = new Schema({
    ISBN: { type: String, unique: true, index: true },
    name: String,
    coverImage: String,
    author: String,
    edition: String,
    pageCount: Number,
    publishYear: Number,
    publisher: String,
    description: String,
    subscribers: [],
    amazonInfo: {
        id: String,
        lastUpdated: Date,
        sellingPrice: Number,
        rentingPrice: Number
    },
    lastSearched: Date
});

// Add schema to db
mongoose.model('books', BookSchema, 'books');

/**** 
Users 
****/

var UserSchema = new Schema({
    name: {
        givenName: String,
        familyName: String,
        fullName: String
    },
    email: { type: String, unique: true },
    verified: { type: Boolean, default: true },
    password: String,
    provider: String,
    providerId: String,
    providerData: {},
    subscriptions: [],
    avatar: String,
    bio: String,
    gradYear: Number,
    reports: [],
    created: Date
});

// Before saving, hash password
UserSchema.pre('save',
    function(next) {
        if (this.password) {
            var md5 = crypto.createHash('md5');
            this.password = md5.update(this.password).digest('hex');
        }
        next();
    }
);

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
    condition: { type: String, required: true },
    sellingPrice: { type: Number },
    rentingPrice: { type: Number },
    created: { type: Date, required: true }
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

ListingSchema.path('sellingPrice').validate(validatePrice, "'sellingPrice' must be an integer between 0-100");
ListingSchema.path('rentingPrice').validate(validatePrice, "'rentingPrice' must be an integer between 0-100");

ListingSchema.path('condition').validate(function (value) {
    return /New|Used/i.test(value);
}, "'condition' must be either New or Used");


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
    date: Date,
    completed: Boolean
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