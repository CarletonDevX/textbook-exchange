// Format responses from API

// Cut name to first name only if user is not logged in
var trimName = function (name, req) {
    if (!req.user) {
        return {givenName: name.givenName, familyName: '', fullName: name.givenName};
    }
    return name;
};

exports.successTestEmail = function (req, res) {
    res.status(200).send('Test email sent.');
};

exports.successUpdateEmail = function (req, res) {
    res.status(200).send('Update email sent.');
};

/** SCHOOLS **/

exports.formatSchoolStats = function (req, res) {
    var stats = {
        'numOpenListings': req.rSchoolStats.numOpenListings,
        'numCompletedListings': req.rSchoolStats.numCompletedListings,
        'numUsers': req.rSchoolStats.numUsers,
    };
    res.json(stats);
};

/** USERS **/

exports.successVerificationEmail = function (req, res) {
    res.status(200).send('Verification email sent.');
};

exports.successRequestPasswordReset = function (req, res) {
    res.status(200).send('Password reset request submitted.');
};

exports.successRemoveUser = function (req, res) {
    res.status(200).send('User deleted.');
};

exports.successClearSubscriptions = function (req, res) {
    res.status(200).send('Subscriptions cleared.');
};

exports.formatCurrentUser = function (req, res) {
    // Case with no listings
    if (!req.rListings) req.rListings = [];

    var user = {
        'userID': req.rUser._id,
        'email': req.rUser.email,
        'emailSettings': req.rUser.emailSettings,
        'avatar': req.rUser.avatar,
        'bio': req.rUser.bio,
        'created': req.rUser.created,
        'gradYear': req.rUser.gradYear,
        'name': req.rUser.name,
    };

    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];

        var formattedBook;
        if (lstng.book != undefined) {
            formattedBook = {
                'name': lstng.book.name,
                'coverImage': lstng.book.coverImage,
                'edition': lstng.book.edition,
            };
        } else {
            formattedBook = {};
        }
        var formattedListing = {
            'userID': lstng.userID,
            'ISBN': lstng.ISBN,
            'listingID': lstng._id,
            'condition': lstng.condition,
            'created': lstng.created,
            'completed': lstng.completed,
            'rentingPrice': lstng.rentingPrice,
            'sellingPrice': lstng.sellingPrice,
            'book': formattedBook,
        };
        listings.push(formattedListing);
    }

    user.listings = listings;
    res.json(user);
};

exports.formatUser = function (req, res) {

    // Case with no listings
    if (!req.rListings) req.rListings = [];

    var user = {
        'userID': req.rUser._id,
        'avatar': req.rUser.avatar,
        'bio': req.rUser.bio,
        'created': req.rUser.created,
        'gradYear': req.rUser.gradYear,
        'name': trimName(req.rUser.name, req),
    };

    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedBook = {
            'name': lstng.book.name,
            'coverImage': lstng.book.coverImage,
            'edition': lstng.book.edition,
        };
        var formattedListing = {
            'userID': lstng.userID,
            'ISBN': lstng.ISBN,
            'listingID': lstng._id,
            'condition': lstng.condition,
            'created': lstng.created,
            'completed': lstng.completed,
            'rentingPrice': lstng.rentingPrice,
            'sellingPrice': lstng.sellingPrice,
            'book': formattedBook,
        };
        listings.push(formattedListing);
    }

    user.listings = listings;
    res.json(user);
};

exports.formatUsers = function (req, res) {
    var users = [];
    for (var i = 0; i < req.rUsers.length; i++) {
        var user = req.rUsers[i];
        var formattedUser = {
            'userID': user._id,
            'avatar': user.avatar,
            'bio': user.bio,
            'created': user.created,
            'gradYear': user.gradYear,
            'name': trimName(user.name, req),
        };
        users.push(formattedUser);
    }
    res.json(users);
};

/** REPORTS **/

exports.successReport = function (req, res) {
    res.status(200).send('Report submitted.');
};

/** LISTINGS **/


exports.successRemoveListing = function (req, res) {
    res.status(200).send('Listing deleted.');
};

exports.formatBookListings = function (req, res) {
    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedUser = {
            'name': trimName(lstng.user.name, req),
            'avatar': lstng.user.avatar,
            'gradYear': lstng.user.gradYear,
        };
        var formattedListing = {
            'userID': lstng.userID,
            'ISBN': lstng.ISBN,
            'listingID': lstng._id,
            'condition': lstng.condition,
            'created': lstng.created,
            'completed': lstng.completed,
            'rentingPrice': lstng.rentingPrice,
            'sellingPrice': lstng.sellingPrice,
            'user': formattedUser,
        };
        listings.push(formattedListing);
    }

    res.json(listings);
};

exports.formatUserListings = function (req, res) {
    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedBook = {
            'name': lstng.book.name,
            'coverImage': lstng.book.coverImage,
            'edition': lstng.book.edition,
        };
        var formattedListing = {
            'userID': lstng.userID,
            'ISBN': lstng.ISBN,
            'listingID': lstng._id,
            'condition': lstng.condition,
            'created': lstng.created,
            'completed': lstng.completed,
            'rentingPrice': lstng.rentingPrice,
            'sellingPrice': lstng.sellingPrice,
            'book': formattedBook,
        };
        listings.push(formattedListing);
    }

    res.json(listings);
};

exports.formatSingleListing = function (req, res) {
    var lstng = req.rListings[0];
    if (!lstng) {
        res.status(404).send('Listing not found by those conditions.');
    }
    var formattedListing = {
        'userID': lstng.userID,
        'ISBN': lstng.ISBN,
        'listingID': lstng._id,
        'condition': lstng.condition,
        'created': lstng.created,
        'completed': lstng.completed,
        'rentingPrice': lstng.rentingPrice,
        'sellingPrice': lstng.sellingPrice,
    };

    res.json(formattedListing);
};

/** OFFERS **/

exports.formatOffers = function (req, res) {
    var offers = [];
    for (var i = 0; i < req.rOffers.length; i++) {
        var offer = req.rOffers[i];
        var formattedOffer = {
            'offerID': offer._id,
            'listingID': offer.listingID,
            'buyerID': offer.buyerID,
            'sellerID': offer.sellerID,
            'ISBN': offer.ISBN,
            'date': offer.date,
        };
        offers.push(formattedOffer);
    };
    res.json(offers);
};

exports.formatOffer = function (req, res) {
    var offer = {
        'offerID': req.rOffer._id,
        'listingID': req.rOffer.listingID,
        'buyerID': req.rOffer.buyerID,
        'sellerID': req.rOffer.sellerID,
        'ISBN': req.rOffer.ISBN,
        'date': req.rOffer.date,
    };

    res.json(offer);
};

/** BOOKS **/

exports.formatBook = function (req, res) {
    var book = {
        'ISBN': req.rBook.ISBN,
        'amazonInfo': req.rBook.amazonInfo,
        'author': req.rBook.author,
        'coverImage': req.rBook.coverImage,
        'description': req.rBook.description,
        'edition': req.rBook.edition,
        'lastSearched': req.rBook.lastSearched,
        'name': req.rBook.name,
        'pageCount': req.rBook.pageCount,
        'publishDate': req.rBook.publishDate,
        'publisher': req.rBook.publisher,
    };
    var listings = [];
    for (var i = 0; i < req.rListings.length; i++) {
        var lstng = req.rListings[i];
        var formattedUser = {
            'name': trimName(lstng.user.name, req),
            'avatar': lstng.user.avatar,
            'gradYear': lstng.user.gradYear,
        };
        var formattedListing = {
            'userID': lstng.userID,
            'listingID': lstng._id,
            'condition': lstng.condition,
            'created': lstng.created,
            'completed': lstng.completed,
            'rentingPrice': lstng.rentingPrice,
            'sellingPrice': lstng.sellingPrice,
            'user': formattedUser,
        };
        listings.push(formattedListing);
    }

    book.listings = listings;
    res.json(book);
};

exports.formatBooks = function (req, res) {
    var books = [];
    for (var i = 0; i < req.rBooks.length; i++) {
        var book = req.rBooks[i];
        var formattedBook = {
            'ISBN': book.ISBN,
            'amazonInfo': book.amazonInfo,
            'author': book.author,
            'coverImage': book.coverImage,
            'description': book.description,
            'edition': book.edition,
            'lastSearched': book.lastSearched,
            'name': book.name,
            'pageCount': book.pageCount,
            'publishDate': book.publishDate,
            'publisher': book.publisher,
            'listings': book.listings || [],
        };
        books.push(formattedBook);
    }
    res.json(books);
};

/* ACTIVITIES */

exports.formatActivities = function(req, res) {
    var activities = [];
    for (var i = 0; i < req.rActivities.length; i++) {
        var activity = req.rActivities[i];
        var formattedActivity = {
            'userID': activity.userID,
            'ISBN': activity.ISBN,
            'verb': activity.verb,
            'when': activity.created,
        };
        activities.push(formattedActivity);
    }
    res.json(activities);
};

/* ERRORS */

// This is a great function name
exports.successError = function (req, res) {
    res.status(200).send('Error report submitted.');
};
