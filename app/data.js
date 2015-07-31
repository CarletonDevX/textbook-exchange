/*** JUNK DATA ***/

exports.books = function() {
	return [
		{
		    name: 'Python Programming: An Introduction to Computer Science',
		    coverImage: null,
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
		    password: '7e9f2b2837519f155580ab962b4dc312',
		    provider: 'local',
		    providerId: '1f5bed9f3ae7e009140ef745a17c19a3',
		    providerData: {},
		    listings: ['2500'],
		    avatar: null,
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
		        avatar: null
		    },
		    ISBN: '1590282418',
		    condition: 'glorious',
		    sellingPrice: '$2.00',
		    rentingPrice: '$1.99',
		    created: null
		}
	];
};