var config = require('./config')(),
	webservices = require('aws-lib');

exports.searchWithKeywords = function (keywords, callback) {
	callback(null, null);
}

exports.infoForBook = function (book, callback) {

	var keywords = book.ISBN;

	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: keywords,  ResponseGroup: "ItemAttributes,Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var item = null;
		var items = result.Items.Item || [];

		// Check if there are multiple items. If so, grab the one with the right ISBN.
		if (items.constructor === Array) {
			for (var i = 0; i < items.length; i++) {
				if (items[i].ISBN == book.ISBN) {
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