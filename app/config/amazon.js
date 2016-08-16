var config = require('./config')();
var AWS = require('aws-lib').createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);

exports.searchWithKeywords = function (keywords, callback) {
    var options = {
        SearchIndex: 'Books', 
        Keywords: keywords,  
        ResponseGroup: 'EditorialReview,Images,ItemAttributes,Offers,OfferSummary',
    };
    AWS.call('ItemSearch', options, function (err, result) {
        if (err) return callback(err);
        var items = result.Items.Item || [];
        var books = [];
        // Response type can be {} or [{}, {}...] so we check if there are multiple items.
        if (items.constructor === Array) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].ItemAttributes.ISBN) books.push(formatBook(items[i])); // Weeds out ebooks
            }
        } else if (items) books.push(formatBook(items));
        callback(null, books);
    });
};

exports.bookWithISBN = function (ISBN, callback) {
    var options = {
        SearchIndex: 'Books',
        Keywords: ISBN,
        ResponseGroup: 'EditorialReview,Images,ItemAttributes,Offers,OfferSummary',
    };
    AWS.call('ItemSearch', options, function (err, result) {
        if (err) return callback(err);
        var items = result.Items.Item || [];
        var book = null;
        // Response type can be {} or [{}, {}...] so we check if there are multiple items.
        if (items.constructor === Array) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].ItemAttributes.EAN == ISBN) book = formatBook(items[i]);
            }
        } else {
            book = formatBook(items);
        }
        callback(null, book);
    });
};

var formatBook = function (item) {
    var info = item.ItemAttributes;
    var ISBN = info.EAN; // This is the same as ISBN-13
    var OfferSummary = item.OfferSummary || { TotalNew: 0, TotalUsed: 0 };
    var author = formatAuthor(info.Author);
    var priceString = get(item, 'Offers.Offer.OfferListing.Price.Amount') || '0';
    var description = get(item, 'EditorialReviews.EditorialReview.Content') || 'No description available.';
    var imageURL =  get(item, 'LargeImage.URL') || '';

    // Turn price string with hundreth's place into integer e.g. 1747 -> 17
    var price = Math.ceil(new Number(priceString) / 100);
    if (price == 0) price = null;

    return {
        ISBN: ISBN,
        name: info.Title,
        coverImage: imageURL,
        author: author,
        edition: info.Edition,
        pageCount: info.NumberOfPages,
        publishDate: info.PublicationDate,
        publisher: info.Publisher,
        description: description,
        subscribers: [],
        amazonInfo: {
            id: item.ASIN,
            url: item.DetailPageURL,
            lastUpdated: new Date(),
            numNew: OfferSummary.TotalNew,
            numUsed: OfferSummary.TotalUsed,
            sellingPrice: price,
        },
        lastSearched: new Date(),
    };
};

// Author can either be an array or a string. We want it to always be an array.
var formatAuthor = function (author) {
    if (!author) author = [''];
    if (author.constructor === String) author = [author];
    return author;
};

// Get nested property if it exists
// http://stackoverflow.com/a/23809123
var get = function (obj, key) {
    return key.split('.').reduce(function (o, x) {
        return (typeof o == 'undefined' || o === null) ? null : o[x];
    }, obj);
};
