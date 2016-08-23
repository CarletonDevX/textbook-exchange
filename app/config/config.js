/* eslint camelcase: "off" */

var env = process.env;

module.exports = function () {
    // Global settings, setup with setup-env.sh
    var settings = {
        reportEmail: env.REPORT_EMAIL,
        mailgun: {
            apiKey: env.MAILGUN_KEY,
            domain: env.MAILGUN_DOMAIN,
            from: env.MAILGUN_FROM,
        },
        avatars: {
            cloud_name: env.AVATARS_CLOUD_NAME, 
            api_key: env.AVATARS_API_KEY, 
            api_secret: env.AVATARS_API_SECRET,     
        },
        amazon: {
            tag: env.AMAZON_TAG,
            clientID: env.AMAZON_CLIENT_ID,
            clientSecret: env.AMAZON_CLIENT_SECRET,
        },
    };
    if (!settings.reportEmail) {
        throw Error('Must set env variables!');
    }
    switch (env.NODE_ENV) {
    case 'development':
        settings.port = env.PORT || 1337;
        settings.db = 'mongodb://localhost/textbook-exchange-development';
        settings.mailEnabled = true;
        settings.url = 'localhost:' + settings.port;
        settings.subdomain_offset = 1;
        break;
    case 'test':
        settings.port = env.PORT || 1337;
        settings.db = 'mongodb://localhost/textbook-exchange-test';
        settings.mailEnabled = false;
        settings.url = 'localhost:' + settings.port;
        break;
    case 'production':
        settings.port = env.PORT || 1337;
        settings.db = env.MONGODB_URI;
        settings.mailEnabled = true;
        settings.url = env.URL;
        settings.subdomain_offset = 2;
        break;
    default:
        break;
    }
    return settings;
};