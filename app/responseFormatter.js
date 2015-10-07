// Formats API responses from retrieved objects

/** SCHOOLS **/

exports.formatSchoolStats = function (req, res) {
    var stats = {
      "numUsers": req.rSchoolStats.numUsers,
      "numListings": req.rSchoolStats.numListings,
      "numOffers": req.rSchoolStats.numOffers
    }
    res.json(stats);
}

/** USERS **/

exports.successVerify = function (req, res) {
  res.status(200).send("User verified.");
}

exports.successRemoveUser = function (req, res) {
  res.status(200).send("User deleted.");
}

exports.successClearSubscriptions = function (req, res) {
  res.status(200).send("Subscriptions cleared.");
}

exports.formatCurrentUser = function (req, res) {
    // Case with no listings
    if (!req.rListings) req.rListings = [];

    var user = {
          "userID": req.rUser._id, 
           "email": req.rUser.email,
          "avatar": req.rUser.avatar, 
             "bio": req.rUser.bio, 
         "created": req.rUser.created, 
        "gradYear": req.rUser.gradYear, 
            "name": req.rUser.name,
   "subscriptions": req.rUser.subscriptions
    }

    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedBook = {
                  "name": lstng.book.name,
            "coverImage": lstng.book.coverImage,
               "edition": lstng.book.edition,
        };
        var formattedListing = {
                  "userID": lstng.userID,
                    "ISBN": lstng.ISBN,
               "listingId": lstng._id, 
               "condition": lstng.condition, 
                 "created": lstng.created, 
               "completed": lstng.completed,
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "book": formattedBook
        }
        listings.push(formattedListing);
    }

    user.listings = listings;
    res.json(user);
}

exports.formatUser = function (req, res) {
    // Case with no listings
    if (!req.rListings) req.rListings = [];

    var user = {
          "userID": req.rUser._id, 
          "avatar": req.rUser.avatar, 
             "bio": req.rUser.bio, 
         "created": req.rUser.created,  
        "gradYear": req.rUser.gradYear, 
            "name": req.rUser.name,
    }

    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedBook = {
                  "name": lstng.book.name,
            "coverImage": lstng.book.coverImage,
               "edition": lstng.book.edition,
        };
        var formattedListing = {
                  "userID": lstng.userID,
                    "ISBN": lstng.ISBN,
               "listingId": lstng._id, 
               "condition": lstng.condition, 
                 "created": lstng.created, 
               "completed": lstng.completed,
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "book": formattedBook
        }
        listings.push(formattedListing);
    }

    user.listings = listings;
    res.json(user);
}

exports.formatSubscriptions = function (req, res) {
    var subscriptions = req.rUser.subscriptions;
    res.json(subscriptions);
}

/** REPORTS **/

exports.successReport = function (req, res) {
  res.status(200).send("Report submitted.");
}

/** LISTINGS **/


exports.successRemoveListing = function (req, res) {
  res.status(200).send("Listing deleted.");
}

exports.formatBookListings = function (req, res) {
    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
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
               "completed": lstng.completed,
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "user": formattedUser
        }
        listings.push(formattedListing);
    }

    res.json(listings);
}

exports.formatUserListings = function (req, res) {
    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
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
               "completed": lstng.completed,
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "book": formattedBook
        }
        listings.push(formattedListing);
    }

    res.json(listings);
}

exports.formatSingleListing = function (req, res) {
    var lstng = req.rListings[0];
    if (!lstng) {
      res.status(404).send('Listing not found by those conditions.');
    }
    var formattedListing = {
              "userID": lstng.userID,
                "ISBN": lstng.ISBN, 
           "listingId": lstng._id, 
           "condition": lstng.condition, 
             "created": lstng.created, 
           "completed": lstng.completed,
        "rentingPrice": lstng.rentingPrice, 
        "sellingPrice": lstng.sellingPrice,
    }

    res.json(formattedListing);
}

exports.formatOffer = function (req, res) {
  var offer = {
          "offerID": req.rOffer._id,
        "listingID": req.rOffer.listingID,
          "buyerID": req.rOffer.buyerID,
         "sellerID": req.rOffer.sellerID,
             "ISBN": req.rOffer.ISBN,
             "date": req.rOffer.date,
        "completed": req.rOffer.completed
  }

  res.json(offer);
}

/** BOOKS **/

exports.formatBook = function (req, res) {
    var book = { 
                "ISBN": req.rBook.ISBN, 
          "amazonInfo": req.rBook.amazonInfo,
              "author": req.rBook.author, 
          "coverImage": req.rBook.coverImage, 
         "description": req.rBook.description, 
             "edition": req.rBook.edition, 
        "lastSearched": req.rBook.lastSearched, 
                "name": req.rBook.name, 
           "pageCount": req.rBook.pageCount, 
         "publishYear": req.rBook.publishYear, 
           "publisher": req.rBook.publisher,
         "subscribers": req.rBook.subscribers
    };

    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
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
               "completed": lstng.completed,
            "rentingPrice": lstng.rentingPrice, 
            "sellingPrice": lstng.sellingPrice,
                    "user": formattedUser
        }
        listings.push(formattedListing);
    }

  	book.listings = listings;
    res.json(book);
}
