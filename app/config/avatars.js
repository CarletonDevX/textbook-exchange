var config = require('./config')(),
	request = require('request'),
    fs = require('fs');

exports.getAvatarWithID = function (id, callback) {
	if (!id) {
		id = '4scEfphWW5' // Default avatar (lol)
	}
    request(config.avatars.endpoint + '/photo/' + id + config.avatars.clientSecret, function (err, response, body) {
        if (err || response.statusCode != 200) {
            callback({ message: "DYP upload error" }, null);
        } else {
            var res = JSON.parse(body);
            callback(null, avatarFromResponse(res));
        }
    });
}

exports.uploadAvatar = function (file, callback) {
    var url = config.avatars.endpoint + '/photo' + config.avatars.clientSecret;

    var req = request.post({ url: url, headers: {'Accepts' : 'application/json'}}, function (err, response, body) {
        if (err || response.statusCode != 200) {
            callback({ message: "DYP upload error" }, null);
        } else {
            var res = JSON.parse(body);
            callback(null, avatarFromResponse(res));
        }
    });

    // Add file to request
    var form = req.form();
    form.append('file', fs.createReadStream(file.path));
}

var avatarFromResponse = function (res) {
    return {
        avatarID: res.id,
        small: res.url.small,
        medium: res.url.medium,
        large: res.url.large
    }
}