var secureConfig = require("./secure-config");

module.exports = function () {
	switch(process.env.NODE_ENV) {
		case "development":
			var settings = secureConfig.settingsWithPort(1337);
			settings.db = "mongodb://localhost/textbook-exchange-development";
			settings.mailEnabled = true;
			return settings;
		case "test":
			var settings = secureConfig.settingsWithPort(6969);
			settings.db = "mongodb://localhost/textbook-exchange-test";
			settings.mailEnabled = false;
			return settings;
		case "production":
			return null;
		default:
			return null;
	}
}