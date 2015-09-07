var app = require("../server"),
    request = require("supertest")(app);
    // expect = require("chai").expect

describe("Auth", function() {
  describe("AuthTest", function() {
    it("Rejects unauthorized users", function(done) {
      request.get('/api/authTest')
        .expect(401, "Not authorized.", done);
    });
  });
});