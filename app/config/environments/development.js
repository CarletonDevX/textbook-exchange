// Variables for the development environment

var port = "1337";

module.exports = {
    port: port,
    db: "mongodb://localhost/textbook-exchange",
    facebook: {
        clientID: '1591101357807096',
        clientSecret: '8a9c28b4d3eb9cbfa117138ae4c4d768',
        callbackURL: 'http://localhost:'+ port +'/oauth/facebook/callback'
    },
    google: {
        clientID: '480832395071-p86iqrqk14209hm24qe1v4jg38m2n9fn.apps.googleusercontent.com',
        clientSecret: 'C2HXEpmYqhUZACB4ptKjP7e4',
        callbackURL: 'http://localhost:'+ port +'/oauth/google/callback'
    }
};