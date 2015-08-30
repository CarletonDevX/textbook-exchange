// Formats API responses from retrieved objects

/** USERS **/

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
               "edition": lstng.book.edition,
                  "ISBN": lstng.ISBN, 
        };
        var formattedListing = {
                  "userID": lstng.userID,
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

/** LISTINGS **/

exports.formatBookListings = function(req, res) {
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

    res.json(listings);
}

exports.formatUserListings = function(req, res) {
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

    res.json(listings);
}

exports.formatSingleListing = function(req, res) {
    var lstng = req.listings[0];
    if (!lstng) {
      res.status(404).send('Listing not found by those conditions.');
    }
    var formattedListing = {
              "userID": lstng.userID,
                "ISBN": lstng.ISBN, 
           "listingId": lstng._id, 
           "condition": lstng.condition, 
             "created": lstng.created, 
        "rentingPrice": lstng.rentingPrice, 
        "sellingPrice": lstng.sellingPrice,
    }

    res.json(formattedListing);
}

/** BOOKS **/

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
