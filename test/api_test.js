var app = require("../server"),
    Session = require("supertest-session")({
		app: app
	}),
    assert = require("chai").assert;

// Will hold David's userID
var userID;
var testISBN = '9781590282410';

var David = {
	    name: {
	        givenName: "David",
	        familyName: "Pickart",
	        fullName: "David Pickart"
	    },
	    email: 'pickartd@carleton.edu',
	    verified: true,
	    password: 'JoesButt',
	    provider: 'local',
	    providerId: '1f5bed9f3ae7e009140ef745a17c19a3',
	    providerData: {},
	    subscriptions: [testISBN],
	    avatar: 'http://graph.facebook.com/613262579/picture?type=square',
	    bio: 'a great guy',
	    gradYear: 2016,
	    reports: [],
	    created: new Date()
	}

var JoeLogin = { username: "slotej@carleton.edu", password: "BigB00ty" }
var JimmyLogin = { username: "spook@carleton.edu", password: "im_a_ghost" }

var Request;
var authRequest = new Session();
var unauthRequest = new Session();

var getRejectTest = function (url) {
	it("Rejects unauthorized users", function(done) {
		unauthRequest
			.get(url)
			.expect(401, "Unauthorized", done);
    });
}

var postRejectTest = function (url) {
	it("Rejects unauthorized users", function(done) {
		unauthRequest
			.post(url)
			.expect(401, "Unauthorized", done);
    });
}

var putRejectTest = function (url) {
	it("Rejects unauthorized users", function(done) {
		unauthRequest
			.put(url)
			.expect(401, "Unauthorized", done);
    });
}

var deleteRejectTest = function (url) {
	it("Rejects unauthorized users", function(done) {
		unauthRequest
			.delete(url)
			.expect(401, "Unauthorized", done);
    });
}

describe("API", function() {

	// Populate DB and log in authRequest
	before(function (done) {
	    authRequest.post('/populate')
	    .end(function(err, res) {
			if (err) {
		    	done(err);
		    } else {
				authRequest.post('/api/login')
				.send({username: David.email, password: David.password})
				.expect(200, "Logged in.", done);
			}
		});
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
			getRejectTest(url);
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
					.send(JimmyLogin)
					.expect(401, "Unauthorized", done);
		    });
		    it("Accepts valid users", function(done) {
				Request
					.post(url)
					.send(JoeLogin)
					.expect(200, "Logged in.", done);
		    });
		});

		describe("POST logout", function() {

			var url = '/api/logout';
		    it("Logs out authorized users", function(done) {
		    	// Log out, then check AuthTest
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
			getRejectTest(url);
	    	it("Returns the correct user", function(done) {
				authRequest
					.get(url)
					.end(function(err, res) {
						// SET USER_ID HERE
						userID = res.body.userID;
				        assert.equal(res.body.email, David.email);
				        done();
				    });
	    	});
	  	});

		describe("PUT user", function() {

			var url = '/api/user';
			putRejectTest(url);
	    	it("Updates the user correctly", function(done) {
				authRequest
					.put(url)
					.send({bio: "test!"})
					.end(function(err, res) {
				        assert.equal(res.body.bio, "test!");
				        done();
				    });
	    	});
	  	});

	  	describe("DELETE user", function() {

			var url = '/api/user';
			deleteRejectTest(url);
	    	it("Deletes the current user", function(done) {
				authRequest
					.delete(url)
					.expect(200, "User deleted.", done);
	    	});
	  	});

		describe("GET user/id", function() {

			var url = '/api/user/';
	    	it("Returns the correct user with ID", function(done) {
				Request
				.get(url + userID)
				.end(function(err, res) {
			        assert.equal(res.body.userID, userID);
			        done();
			    });
	    	});
	  	});
	});

	/*** SUBSCRIPTIONS ***/
	describe("Subscriptions", function() {

		describe("GET subscriptions", function() {

			var url = '/api/subscriptions';
			getRejectTest(url);
	    	it("Returns the correct subscriptions", function(done) {
				authRequest
					.get(url)
					.end(function(err, res) {
				        assert.deepEqual(res.body, David.subscriptions);
				        done();
				    });
	    	});
	  	});

	  	describe("POST subscriptions/clear", function() {

			var url = '/api/subscriptions/clear';
			postRejectTest(url);
	    	it("Clears subscriptions", function(done) {
	    		// Clear subscriptions, then check to make sure they're empty
				authRequest
					.post(url)
					.end(function(err, res) {
						if (err) {
					    	done(err);
					    } else {
							authRequest
								.get('/api/subscriptions')
								.end(function(err, res) {
							        assert.deepEqual(res.body, []);
							        done();
							    });
						}
				        
				    });
	    	});
	  	});
		
		describe("POST subscriptions/add/id", function() {

			var url = '/api/subscriptions/add/' + testISBN;
			postRejectTest(url);
	    	it("Adds correct subscription to user", function(done) {
				authRequest
					.post(url)
					.end(function(err, res) {
				        assert.deepEqual(res.body, David.subscriptions);
				        done();
				    });
	    	});

	    	it("Adds correct subscriber to book", function(done) {
				authRequest
					.get('/api/book/'+ testISBN)
					.end(function(err, res) {
				        assert.deepEqual(res.body.subscribers, [userID]);
				        done();
				    });
	    	});
	  	});

		describe("POST subscriptions/remove/id", function() {

			var url = '/api/subscriptions/remove/' + testISBN;
			postRejectTest(url);
	    	it("Removes correct subscription from user", function(done) {
	    		// Remove subscription, then check to make sure it was removed
				authRequest
					.post(url)
					.end(function(err, res) {
				        assert.deepEqual(res.body, []);
				        done(); 
				    });
	    	});

	    	it("Removes correct subscriber from book", function(done) {
				authRequest
					.get('/api/book/'+ testISBN)
					.end(function(err, res) {
				        assert.deepEqual(res.body.subscribers, []);
				        done();
				    });
	    	});
	  	});
	});

	/*** BOOKS ***/
	describe("Books", function() {

		describe("GET book/id", function() {

			var url = '/api/book/' + testISBN;

	    	it("Returns the correct book", function(done) {
				authRequest
					.get(url)
					.end(function(err, res) {
				        assert.equal(res.body.ISBN, testISBN);
				        done();
				    });
	    	});
	  	});
	});
});