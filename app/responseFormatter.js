// Formats API responses from retrieved objects

exports.formatUser = function(req, res) {
    var user = {
          "userID": req.user._id, 
          "avatar": req.user.avatar, 
             "bio": req.user.bio, 
         "created": req.user.created,  
        "gradYear": req.user.gradYear, 
            "name": req.user.name,
         "reports": req.user.reports
    }

    var listings = [];
    for (var i = 0; i < req.listings.length; i++) {
        var lstng = req.listings[i];
        var formattedBook = {
                  "name": lstng.book.name,
            "coverImage": lstng.book.coverImage,
               "edition": lstng.book.edition
        };
        var formattedListing = {
                  "userID": lstng.userID,
                    "ISBN": lstng.ISBN, 
               "listingId": lstng._id, 
               "condition": lstng.condition, 
                 "created": lstng.created, 
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "book": formattedBook
        }
        listings.push(formattedListing);
    }

    user.listings = listings;
    res.json(user);
}

exports.formatBook = function(req, res) {
    var book = { 
                "ISBN": req.book.ISBN, 
          "amazonInfo": req.book.amazonInfo,
              "author": req.book.author, 
          "coverImage": req.book.coverImage, 
         "description": req.book.description, 
             "edition": req.book.edition, 
        "lastSearched": req.book.lastSearched, 
                "name": req.book.name, 
           "pageCount": req.book.pageCount, 
         "publishYear": req.book.publishYear, 
           "publisher": req.book.publisher
    };

    var listings = [];
    for (var i = 0; i < req.listings.length; i++) {
        var lstng = req.listings[i];
        var formattedUser = {
            "name": lstng.user.name,
            "avatar": lstng.user.avatar,
            "gradYear": lstng.user.gradYear
        };
        var formattedListing = {
                  "userID": lstng.userID,
                    "ISBN": lstng.ISBN, 
               "listingId": lstng._id, 
               "condition": lstng.condition, 
                 "created": lstng.created, 
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "user": formattedUser
        }
        listings.push(formattedListing);
    }

	book.listings = listings;
    res.json(book);
}

//below not fixed yet

exports.formatListingResponse = function(req, res) {
    var listings = formatListings(req.listings);
    res.json(listings);
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