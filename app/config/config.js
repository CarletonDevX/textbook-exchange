/* eslint camelcase: "off" */

var secureConfig = require('./secure-config');

module.exports = function () {
    var settings = {};
    switch (process.env.NODE_ENV) {
    case 'development':
        settings = secureConfig.settingsWithPort(process.env.PORT || 1337);
        settings.db = 'mongodb://localhost/textbook-exchange-development';
        settings.mailEnabled = true;
        settings.url = 'localhost:' + settings.port;
        settings.subdomain_offset = 1;
        break;
    case 'test':
        settings = secureConfig.settingsWithPort(6969);
        settings.db = 'mongodb://localhost/textbook-exchange-test';
        settings.mailEnabled = false;
        settings.url = 'localhost:' + settings.port;
        break;
    case 'production':
        settings = secureConfig.settingsWithPort(process.env.PORT || 1337);
        settings.db = 'mongodb://localhost/textbook-exchange-production';
        settings.mailEnabled = true;
        settings.url = 'hitsthebooks.com';
        settings.subdomain_offset = 2;
        break;
    default:
        break;
    }
    return settings;
};