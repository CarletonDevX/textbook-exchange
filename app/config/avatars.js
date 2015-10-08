// No longer being used, really.

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

exports.uploadAvatar = function (file, callback) {
    var url = config.avatars.endpoint + '/photo' + config.avatars.clientSecret;
    var formData = { "files": file };

    request.post({url: url, formData: formData, headers: {'Accept': 'application/json'}}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
    callback(null);
}