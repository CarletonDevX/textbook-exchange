/*** JUNK DATA ***/

exports.books = function() {
	return [
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
		        lastUpdated: null,
		        sellingPrice: 19.99,
		        rentingPrice: 13.00
		    },
		    lastSearched: null
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
		    description: 'Whether you use your computer for bookkeeping, making travel plans, socializing, shopping, or just plain fun, computers are now an essential part of daily life. But it can be overwhelming to keep up with the technology as it continually evolves. This clear, friendly guide not only gets you up to speed on computer basics, it also covers the very latest information, like the changes you?ll see with Windows 8.',
		    amazonInfo: {
		        id: '1118115538',
		        lastUpdated: null,
		        sellingPrice: 17.47,
		        rentingPrice: 13.00
		    },
		    lastSearched: null
		}
	];
};

exports.users = function() {
	return [
		{
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
		    userID: '58008',
		    ISBN: '9781118115534',
		    condition: 'glorious',
		    sellingPrice: '$2.00',
		    rentingPrice: '$1.99',
		    created: null
		}
	];
};