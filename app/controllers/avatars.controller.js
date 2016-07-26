var fs = require('fs'),
	multer = require('multer'),
	avatars = require('../config/avatars'),
	HTBError = require('../errors').HTBError;

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
	if (!req.file) return next(new HTBError(400, 'Must include "file" attribute.'));
	// Upload locally to tmp
	uploadLocal(req, res, function (err) {
		if (err) return next(new HTBError(500, err.message));
		// Upload file to cloudinary, using user ID as the file ID. Then set avatar as URL of uploaded image
		avatars.uploader.upload(req.file.path, function(result) { 
			req.rAvatar = result.url;
			return next();
		},{ public_id: req.user._id });
	});
}