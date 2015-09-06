var config = require('./config')(),
	request = require('request');

exports.getAvatarWithID = function (id, callback) {
	if (!id) {
		id = '4scEfphWW5' // Default avatar (lol)
	}
    request(config.avatars.endpoint + '/photo/' + id + config.avatars.clientSecret, function (error, response, body) {
        var image = null;
        if (!error && response.statusCode == 200) 
        {
            image = JSON.parse(body).url.small;
        }
        callback(image);
    });
}