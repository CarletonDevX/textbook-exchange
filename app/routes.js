var users = require('./controllers/users.controller');

exports.setup = function(app) {

	// Main page
    app.get('/', function (req, res) {
	    res.render('index', {
	        "title": "Textbook Exchange",
	        "desc": "Time to hit the books!"
	    })
    });

    app.get('/users', function (req, res) {
    	users.list(req, res);
    });

    app.post('/register', function (req, res) {
    	users.create(req, res, function () {
    		users.list(req, res);
    	});
    });
};