var config = require('./config')(),
	request = require('request');

exports.infoWithISBN = function (isbn, callback) {
	info = {
		id: "hey",
		lastUpdated: new Date()
	}
	callback(null, info);
}