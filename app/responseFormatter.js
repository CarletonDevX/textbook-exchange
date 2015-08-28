// Formats API responses from retrieved objects

exports.formatListingResponse = function(req, res) {
	var listings = formatListings(req.listings);
	res.json(listings);
}

exports.formatBookResponse = function(req, res) {
	var book = formatBook(req.book),
		listings = formatListings(req.listings);

	book.listings = listings;
    res.json(book);
}

// Helpers
formatListings = function (listings) {
	newListings = [];
	for (var i = 0; i < listings.length; i++) {
		listing = listings[i];
		newListing = {
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