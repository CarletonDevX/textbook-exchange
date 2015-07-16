var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

/**** 
Books 
****/

var BookSchema = new Schema({
    name: String,
    coverImage: String,
    author: String,
    edition: String,
    pageCount: String,
    publishYear: String,
    publisher: String,
    ISBN: String,
    description: String,
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
    email: { type: String, trim: true, unique: true },
    verified: { type: Boolean, default: true },
    password: String,
    provider: String,
    providerId: String,
    providerData: {},
    listings: [],
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
    userID: String,
    ISBN: String,
    condition: String,
    sellingPrice: String,
    rentingPrice: String,
    created: Date
});

// Add schema to db
mongoose.model('listings', ListingSchema, 'listings');

/***********
Transactions 
***********/

var TransactionSchema = new Schema({
    listingID: String,
    buyerID: String,
    sellerID: String,
    ISBN: String,
    date: Date,
    completed: Boolean
});

// Add schema to db
mongoose.model('transactions', TransactionSchema, 'transactions');

/***********
School Stats 
***********/

var SchoolStatsSchema = new Schema({
    booksSold: Number,
    booksListed: Number
});

// Add schema to db
mongoose.model('schoolStats', SchoolStatsSchema, 'schoolStats');