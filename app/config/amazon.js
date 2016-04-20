var config = require('./config')(),
	webservices = require('aws-lib');

exports.searchWithKeywords = function (keywords, callback) {
	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: keywords,  ResponseGroup: "EditorialReview,Images,ItemAttributes,Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var items = result.Items.Item || [];
		var books = [];

		// Response type can be {} or [{}, {}...] so we check if there are multiple items.
		if (items.constructor === Array) {
			for (var i = 0; i < items.length; i++) {
				// Fuck ebooks
				if (items[i].ItemAttributes.ISBN) books.push(bookify(items[i]));
			};
		} else {
			if (items) books.push(bookify(items));
		}

		callback(err, books);
	});
}

exports.bookWithISBN = function (ISBN, callback) {
	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: ISBN,  ResponseGroup: "EditorialReview,Images,ItemAttributes,Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var items = result.Items.Item || [];
		var book = null;

		// Response type can be {} or [{}, {}...] so we check if there are multiple items.
		// If so, we grab the one with the right ISBN.
		if (items.constructor === Array) {
			for (var i = 0; i < items.length; i++) {
				if (items[i].ItemAttributes.ISBN == ISBN) {
					book = bookify(items[i]);
				}
			};
		} else {
			book = bookify(items);
		}

		callback(err, book);
	});
}

var bookify = function (item) {

	var info = item.ItemAttributes;
	var OfferSummary = item.OfferSummary || { TotalNew: 0, TotalUsed: 0 };
	var author = formatAuthor(info.Author);

	var priceString = get(item, 'Offers.Offer.OfferListing.Price.Amount') || '0';
	var description = get(item, 'EditorialReviews.EditorialReview.Content') || 'No description available.';
	var imageURL =  get(item, 'LargeImage.URL') || "";

	// If we want to remove HTML tags (http://stackoverflow.com/a/5002161)
	// description = description.replace(/<\/?[^>]+(>|$)/g, "");

	// Turn price string with hundreths place into integer e.g. 1747 -> 17
	var price = Math.ceil(new Number(priceString) / 100);
	if (price == 0) price = null;

	return {
	    ISBN: info.ISBN,
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
			sellingPrice: price
	    },
	    lastSearched: new Date()
	}
}

// Author can either be an array or a string. We want it to always be an array.
var formatAuthor = function (author) {
	if (!author) return "";

	if (author.constructor === String) {
		return [author];
	} else {
		return author;
	}
}

// Get nested property if it exists
// http://stackoverflow.com/a/23809123
var get = function(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null) ? null : o[x];
    }, obj);
}