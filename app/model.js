var mongoose = require('mongoose');

var User = mongoose.model('User', {
    	name: String,
    	email: String,
    	password: String
	});

module.exports = {
    User: User
};