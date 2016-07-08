var secureConfig = require("./secure-config");

module.exports = function () {
	switch(process.env.NODE_ENV) {
		case "development":
			var settings = secureConfig.settingsWithPort(process.env.PORT || 1337);
			settings.db = "mongodb://localhost/textbook-exchange-development";
			settings.mailEnabled = true;
			settings.url = "localhost:" + settings.port;
			return settings;
		case "test":
			var settings = secureConfig.settingsWithPort(6969);
			settings.db = "mongodb://localhost/textbook-exchange-test";
			settings.mailEnabled = false;
			settings.url = "localhost:" + settings.port;
			return settings;
		case "production":
			return null;
		default:
			return null;
	}
}
