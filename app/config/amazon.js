var config = require('./config')(),
	webservices = require('aws-lib');

exports.infoForBook = function (book, callback) {

	var keywords = book.ISBN;

	var prodAdv = webservices.createProdAdvClient(config.amazon.clientID, config.amazon.clientSecret, config.amazon.tag);
	var options = {SearchIndex: "Books", Keywords: keywords,  ResponseGroup: "Offers,OfferSummary"}

	prodAdv.call("ItemSearch", options, function(err, result) {

		var item = result.Items.Item;
		if (!item) {
			callback({message: "Item not found."}, null);
			return;
		}

		// Check if there are multiple items. If so, grab the first.
		// TODO: Make sure the first result is consistenly the right one
		if (item.constructor === Array) {
			if (item.length > 0) item = item[0];
		}

		// Turn price string with hundreths place into integer e.g. 1747 -> 17
		// TODO: make sure responses always have these properties, handle exceptions
		var priceString = item.Offers.Offer.OfferListing.Price.Amount;
		var price = Math.floor(new Number(priceString) / 100);

		info = {
			id: item.ASIN,
			url: item.Offers.MoreOffersUrl,
			lastUpdated: new Date(),
			numNew: item.OfferSummary.TotalNew,
			numUsed: item.OfferSummary.TotalUsed,
			sellingPrice: price
		}

		callback(err, info);
	});
}