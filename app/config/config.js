var secureConfig = require("./secure-config");

module.exports = function () {
	switch(process.env.NODE_ENV) {
		case "development":
			var settings = secureConfig.settingsWithPort(process.env.PORT || 1337);
			settings.db = "mongodb://localhost/textbook-exchange-development";
			settings.mailEnabled = true;
			settings.url = "localhost:" + settings.port;
			settings.subdomain_offset = 1;
			return settings;
		case "test":
			var settings = secureConfig.settingsWithPort(6969);
			settings.db = "mongodb://localhost/textbook-exchange-test";
			settings.mailEnabled = false;
			settings.url = "localhost:" + settings.port;
			return settings;
		case "production":
			var settings = secureConfig.settingsWithPort(process.env.PORT || 1337);
			settings.db = "mongodb://localhost/textbook-exchange-production";
			settings.mailEnabled = true;
			settings.url = "hitsthebooks.com";
			settings.subdomain_offset = 2;
			return settings;
		default:
			return null;
	}
}
