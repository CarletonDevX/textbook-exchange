/*** JUNK DATA ***/

exports.books = function() {
	return [
		{
		    name: 'Python Programming: An Introduction to Computer Science',
		    coverImage: 'https://books.google.com/books/content?id=aJQILlLxRmAC&printsec=frontcover&img=1&zoom=5',
		    author: 'John Zelle',
		    edition: null,
		    pageCount: 432,
		    publishYear: 2010,
		    publisher: 'Franklin, Beedle & Associates Inc.',
		    ISBN: '1590282418',
		    description: 'This book is designed to be used as the primary textbook in a college-level first course in computing.',
		    amazonInfo: {
		        id: '1590282418',
		        lastUpdated: null,
		        sellingPrice: 19.99,
		        rentingPrice: 13.00
		    },
		    lastSearched: null
		}
	];
};

exports.users = function() {
	return [
		{
			userID: '58008',
		    name: {
		        givenName: "David",
		        familyName: "Pickart",
		        fullName: "David Pickart"
		    },
		    email: 'pickartd@carleton.edu',
		    verified: true,
		    password: 'JoesButt',
		    provider: 'local',
		    providerId: '1f5bed9f3ae7e009140ef745a17c19a3',
		    providerData: {},
		    listings: ['2500'],
		    avatar: 'http://graph.facebook.com/613262579/picture?type=square',
		    bio: 'a great guy',
		    gradYear: 2016,
		    reports: [],
		    created: null
		}
	];
};

exports.listings = function() {
	return [
		{
			ID: '2500',
		    user: {
		        userID: '58008',
		        fullName: 'David Pickart',
		        avatar: 'http://graph.facebook.com/613262579/picture?type=square'
		    },
		    ISBN: '1590282418',
		    condition: 'glorious',
		    sellingPrice: '$2.00',
		    rentingPrice: '$1.99',
		    created: null
		}
	];
};