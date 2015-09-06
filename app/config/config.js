var settingsWithPort = function (port) {
	var generalSettings = {
	    port: port,
	    emailID: 'textbookexchange25',
	    emailPassword: 'joesbigbutt',
	    facebook: {
	        clientID: '1591101357807096',
	        clientSecret: '8a9c28b4d3eb9cbfa117138ae4c4d768',
	        callbackURL: 'http://localhost:'+ port +'/oauth/facebook/callback'
	    },
	    google: {
	        clientID: '480832395071-p86iqrqk14209hm24qe1v4jg38m2n9fn.apps.googleusercontent.com',
	        clientSecret: 'C2HXEpmYqhUZACB4ptKjP7e4',
	        callbackURL: 'http://localhost:'+ port +'/oauth/google/callback'
	    },
	    avatars: {
	        endpoint: 'https://api.dumpyourphoto.com/v1',
	        clientSecret: '?api_key=JFM36bCttTccIswJLMmSjGkxINh3KCGH5fmtr6zuNvqslb4SBCloWNbJgifWccdmWVpkhdRiw8NpaAssLrckJHNYhzmsCxsbPedG'
	    }
	};
	return generalSettings;
}

module.exports = function () {
	switch(process.env.NODE_ENV) {
		case "development":
			var settings = settingsWithPort(1337);
			settings.db = "mongodb://localhost/textbook-exchange-development";
			return settings;
		case "test":
			var settings = settingsWithPort(6969);
			settings.db = "mongodb://localhost/textbook-exchange-test";
			return settings;
		case "production":
			return null;
		default:
			return null;
	}
}