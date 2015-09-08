var app = require("../server"),
    Session = require("supertest-session")({
		app: app
	}),
    assert = require("chai").assert;

var David = { username: "pickartd@carleton.edu", password: "JoesButt" }
var Joe = { username: "slotej@carleton.edu", password: "BigB00ty" }
var Jimmy = { username: "spook@carleton.edu", password: "im_a_ghost" }

var Request;
var authRequest = new Session();
var unauthRequest = new Session();

var rejectTest = function (url) {
	it("Rejects unauthorized users", function(done) {
		unauthRequest
			.get(url)
			.expect(401, "Unauthorized", done);
    });
}

describe("API", function() {

	// Log in authRequest
	before(function (done) {
	    authRequest.post('/api/login')
			.send(David)
			.expect(200, "Logged in.", done);
	});

	/*** AUTH ***/
	describe("Auth", function() {

		// Reset session
		before(function (done) {
			Request = new Session();
			done();
		});

		describe("GET authTest", function() {

			var url = '/api/authTest';
			rejectTest(url);
	    	it("Accepts authorized users", function(done) {
				authRequest
					.get(url)
	        		.expect(200, "Yay", done);
	    	});
	  	});

		describe("POST login", function() {

			var url = '/api/login';
			it("Rejects invalid users", function(done) {
				Request
					.post(url)
					.send(Jimmy)
					.expect(401, "Unauthorized", done);
		    });
		    it("Accepts valid users", function(done) {
				Request
					.post(url)
					.send(Joe)
					.expect(200, "Logged in.", done);
		    });
		});

		describe("POST logout", function() {

			var url = '/api/logout';
		    it("Logs out authorized users", function(done) {
				Request
					.post(url)
					.expect(200, "Logged out.", function (err) {
					    if (err) {
					    	done(err);
					    } else {
							Request
								.get('/api/authTest')
								.expect(401, "Unauthorized", done);
						}
					});
		    });
		});
	});

	/*** USERS ***/
	describe("Users", function() {

		describe("GET user", function() {

			var url = '/api/user';
			rejectTest(url);
	    	it("Returns the correct user", function(done) {
				authRequest
					.get(url)
					.end(function(err, res) {
				        assert.equal(res.body.email, David.username);
				        done();
				    });
	    	});
	  	});
	});
});