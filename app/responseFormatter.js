// Formats API responses from retrieved objects

exports.formatUserResponse = function(req, res) {
    var user = formatUser(req.user),
        listings = formatListings(req.listings);
    user.listings = listings;
    res.json(user);
}

exports.formatListingResponse = function(req, res) {
	var listings = formatListings(req.listings);
	res.json(listings);
}

exports.formatListingResponseForBook = function(req, res) {
    var listings = formatListingsForBook(req.listings);
    res.json(listings);
}

exports.formatBookResponse = function(req, res) {
	var book = formatBook(req.book),
		listings = formatListingsForBook(req.listings);

	book.listings = listings;
    res.json(book);
}

// Helpers
formatUser = function (user) {
    newUser = {
        "userID": user._id, 
        "avatar": user.avatar, 
        "bio": user.bio, 
        "created": user.created,  
        "gradYear": user.gradYear, 
        "name": user.name,
        "reports": user.reports
    }
    return newUser;
}

formatListings = function (listings) {
	newListings = [];
	for (var i = 0; i < listings.length; i++) {
		listing = listings[i];
		newListing = {
            "userID": listing.userID,
			"ISBN": listing.ISBN, 
            "listingId": listing._id, 
            "condition": listing.condition, 
            "created": listing.created, 
            "rentingPrice": listing.rentingPrice, 
            "sellingPrice": listing.sellingPrice
		}
		newListings.push(newListing);
	}
	return newListings;
}

formatListingsForBook = function (listings) {
    newListings = [];
    for (var i = 0; i < listings.length; i++) {
        listing = listings[i];
        newListing = {
            "userID": listing.userID,
            "ISBN": listing.ISBN, 
            "listingId": listing._id, 
            "condition": listing.condition, 
            "created": listing.created, 
            "rentingPrice": listing.rentingPrice, 
            "sellingPrice": listing.sellingPrice,
            "user": listing.user
        }
        newListings.push(newListing);
    }
    return newListings;
}

formatBook = function (book) {
    newBook = { 
        "ISBN": book.ISBN, 
        "amazonInfo": book.amazonInfo,
        "author": book.author, 
        "coverImage": book.coverImage, 
        "description": book.description, 
        "edition": book.edition, 
        "lastSearched": book.lastSearched, 
        "name": book.name, 
        "pageCount": book.pageCount, 
        "publishYear": book.publishYear, 
        "publisher": book.publisher
    };

    return newBook;
}