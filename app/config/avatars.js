// Yeesh, an unintelligible file ;)

var cloudinary = require('cloudinary'),
    config = require('./config');

cloudinary.config(config.avatars);

module.exports = cloudinary;