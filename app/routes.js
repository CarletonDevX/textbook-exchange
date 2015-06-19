var users = require('./controllers/user.controller');

exports.setup = function(app) {

	// Main page
    app.get('/', function (req, res) {
	    res.render('index', {
	        "title": "Textbook Exchange",
	        "desc": "Get ur textbooks 4 free"
	    })
    });

    // User stuff
	app.route('/users').post(users.create).get(users.list);
};