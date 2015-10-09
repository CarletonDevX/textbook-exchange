var config = require('../config/config')(),
	request = require('request'),
    fs = require('fs'),
    multer = require('multer'),
    Error = require('../errors');

// Multer setup for uploads

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/');
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.split(".").pop();
    cb(null, req.rUser._id + "." + ext);
  }
});

var uploadLocal = multer({ storage: storage }).single('file');

exports.uploadAvatar = function (req, res, next) {
    var user = req.rUser;

    // Upload locally
    uploadLocal(req, res, function (err) {
        if (!req.file) err = { message: 'Must include "file" attribute.' }
            
        if (err) {
            Error.errorWithStatus(req, res, 400, err);
        } else {
            uploadRemote(req.file, function (err, avatar) {
                if (err) {
                    Error.errorWithStatus(req, res, 500, err);
                } else {
                    req.rAvatar = avatar;
                    next();
                }
            });
        }
    });
}

/* HELPERS */

// Not being used
var getAvatarWithID = function (id, callback) {
    var url = config.avatars.endpoint + '/photo/' + id + config.avatars.clientSecret;
    request(url, function (err, response, body) {
        if (err || response.statusCode != 200) {
            callback({ message: "DYP upload error" }, null);
        } else {
            var res = JSON.parse(body);
            callback(null, avatarFromResponse(res));
        }
    });
}

var uploadRemote = function (file, callback) {
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