var mongoose = require('mongoose'),
	Book = require('mongoose').model('books'),
    Listing = require('mongoose').model('listings'),
    User = require('mongoose').model('users');

/*** JUNK DATA ***/

var junkBooks = [
	{
	    name: 'Python Programming: An Introduction to Computer Science',
	    coverImage: 'https://books.google.com/books/content?id=aJQILlLxRmAC&printsec=frontcover&img=1&zoom=5',
	    author: 'John Zelle',
	    edition: 1,
	    pageCount: 432,
	    publishYear: 2010,
	    publisher: 'Franklin, Beedle & Associates Inc.',
	    ISBN: '9781590282410',
	    description: 'This book is designed to be used as the primary textbook in a college-level first course in computing.',
	    amazonInfo: {
	        id: '1590282418',
	        url: 'default',
	        lastUpdated: new Date(),
	        numUsed: 1,
	        numNew: 1,
	        sellingPrice: 19.99
	    },
	    subscribers: [],
	    lastSearched: new Date()
	},
	{
	    name: 'Computers For Seniors For Dummies',
	    coverImage: 'https://books.google.com/books/content?id=R7XFJWI6eJUC&printsec=frontcover&img=1&zoom=5',
	    author: 'Nancy C. Muir',
	    edition: 3,
	    pageCount: 200,
	    publishYear: 2010,
	    publisher: 'For Dummies',
	    ISBN: '9781118115534',
	    description: 'Whether you use your computer for bookkeeping, making travel plans, socializing, shopping, or just plain fun, computers are now an essential part of daily life. But it can be overwhelming to keep up with the technology as it continually evolves. This clear, friendly guide not only gets you up to speed on computer basics, it also covers the very latest information, like the changes you\'ll see with Windows 8.',
	    amazonInfo: {
	        id: '1118115538',
	        url: 'default',
	        lastUpdated: new Date(),
	        numUsed: 1,
	        numNew: 1,
	        sellingPrice: 17.47
	    },
	    subscribers: [],
	    lastSearched: new Date()
	}
];

var junkUsers = [
	{
	    name: {
	        givenName: "David",
	        familyName: "Pickart",
	        fullName: "David Pickart"
	    },
	    email: 'pickartd@carleton.edu',
	    verified: true,
	    password: '04759bc15b8dc4ffe289a27d387ab2c0',
	    provider: 'local',
	    providerId: '1f5bed9f3ae7e009140ef745a17c19a3',
	    providerData: {},
	    subscriptions: ['9781590282410'],
	    bio: 'a great guy',
	    gradYear: 2016,
	    reports: [],
	    created: new Date()
	},
	{
	    name: {
	        givenName: "Joe",
	        familyName: "Slote",
	        fullName: "Joe Slote"
	    },
	    email: 'slotej@carleton.edu',
	    verified: true,
	    password: '1461b1e2d909819356d591e770acd604',
	    provider: 'local',
	    providerId: '1f5bed9f3ae7e009140ef745a17c19a3',
	    providerData: {},
	    subscriptions: [],
	    bio: 'an OK guy',
	    gradYear: 2016,
	    reports: [],
	    created: new Date()
	}
];

/*** Population functions ***/

var _this = this;

exports.clear = function () {
    var Book = mongoose.model('books');
    var clearBook = new Book(); 
    clearBook.collection.drop();

    var User = mongoose.model('users');
    var clearUser = new User(); 
    clearUser.collection.drop();

    var Listing = mongoose.model('listings');
    var clearListing = new Listing(); 
    clearListing.collection.drop();
}

exports.populate = function () {
	_this.clear();

    var Book = mongoose.model('books');

    for (var i = 0; i < junkBooks.length; i++) {
        var junkbook = new Book(junkBooks[i]);
        junkbook.save();
    }

    var User = mongoose.model('users');

    for (var i = 0; i < junkUsers.length; i++) {
        var junkuser = new User(junkUsers[i]);
        junkuser.save();
    }
}

var addListingWithUser = function (user) {
    var Listing = mongoose.model('listings');
    // I'm responsible for the only listing
	if (user.email == "pickartd@carleton.edu") {
		var junklisting = new Listing ({
			userID: user._id,
		    ISBN: '9781118115534',
		    condition: 'New',
		    completed: false,
		    sellingPrice: 2,
		    rentingPrice: 2,
		    created: new Date()
		});
		junklisting.save();
	}
};
