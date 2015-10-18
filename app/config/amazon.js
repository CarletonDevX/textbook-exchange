var config = require('./config')(),
	webservices = require('aws-lib');

exports.searchWithKeywords = function (keywords, callback) {
	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: keywords,  ResponseGroup: "EditorialReview,Images,ItemAttributes,Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var items = result.Items.Item || [];
		var books = [];

		// Check if there are multiple items.
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

exports.infoForBook = function (book, callback) {
	// TODO: If we already have the amazon ID, we can find the specific book instead of searching

	var keywords = book.ISBN;

	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: keywords,  ResponseGroup: "ItemAttributes,Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var items = result.Items.Item || [];
		var item = null;

		// Check if there are multiple items. If so, grab the one with the right ISBN.
		if (items.constructor === Array) {
			for (var i = 0; i < items.length; i++) {
				if (items[i].ItemAttributes.ISBN == book.ISBN) {
					item = items[i];
				}
			};
		} else {
			item = items;
		}

		if (!item) {
			callback({message: "Item not found on Amazon."}, null);
			return;
		}

		// Turn price string with hundreths place into integer e.g. 1747 -> 17
		// TODO: make sure responses always have these properties, handle exceptions
		var priceString = item.Offers.Offer.OfferListing.Price.Amount;
		var price = Math.floor(new Number(priceString) / 100);

		info = {
			id: item.ASIN,
			url: item.DetailPageURL,
			lastUpdated: new Date(),
			numNew: item.OfferSummary.TotalNew,
			numUsed: item.OfferSummary.TotalUsed,
			sellingPrice: price
		}

		callback(err, info);
	});
}

var bookify = function (item) {

	var info = item.ItemAttributes;
	var OfferSummary = item.OfferSummary || { TotalNew: 0, TotalUsed: 0 };

	var priceString = "0";
	var description = "No description available";
	var imageURL = "";


	// TODO: make this less gross
	try {
		description = item.EditorialReviews.EditorialReview.Content;
	} catch (err) {}
	try {
		imageURL = item.LargeImage.URL;
	} catch (err) {}
	try {
		priceString = item.Offers.Offer.OfferListing.Price.Amount;
	} catch (err) {}

	var price = Math.floor(new Number(priceString) / 100);

	return {
	    ISBN: info.ISBN,
	    name: info.Title,
	    coverImage: imageURL,
	    author: info.Author,
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