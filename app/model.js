var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    data = require('./data.js');

/**** 
Books 
****/

var BookSchema = new Schema({
    ISBN: String,
    name: String,
    coverImage: String,
    author: String,
    edition: String,
    pageCount: Number,
    publishYear: Number,
    publisher: String,
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

generateBooks = function () {
    var Book = mongoose.model('books');
    var junkbooks = data.books();

    // Clear and add junk data
    var clear = new Book(); 
    clear.collection.drop();
    for (var i = 0; i < junkbooks.length; i++) {
        var junkbook = new Book(junkbooks[i]);
        junkbook.save();
    }
    generateUsers();
}

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
    // listings: [],
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

generateUsers = function () {
    var User = mongoose.model('users');
    var junkusers = data.users();

    // Clear and add junk data
    var clear = new User(); 
    clear.collection.drop();
    for (var i = 0; i < junkusers.length; i++) {
        var junkuser = new User(junkusers[i]);
        junkuser.save(function (err, user) {
            generateListings();
        });
    }
}

/*******
Listings 
*******/

var ListingSchema = new Schema({
    userID: String,
    ISBN: String, //which is the book id
    condition: String,
    sellingPrice: String,
    rentingPrice: String,
    created: Date
});

// Add schema to db
mongoose.model('listings', ListingSchema, 'listings');

generateListings = function () {
    var Listing = mongoose.model('listings');
    var junklistings = data.listings();

    // Clear and add junk data
    var clear = new Listing(); 
    clear.collection.drop();

    // I'm responsible for all listings, of course
    User = mongoose.model('users');
    User.findOne({email: 'pickartd@carleton.edu'}, function(err, user) {
        for (var i = 0; i < junklistings.length; i++) {
            var junklisting = new Listing(junklistings[i]);
            junklisting.userID = user._id;
            junklisting.save();
        }
    });
}

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

// Get the data generation party started
generateBooks();