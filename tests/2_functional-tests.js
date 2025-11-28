const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test("Test POST request for all issue properties", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional test",
        assigned_to: "Chai",
        status_text: "In QA"
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);

        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");

        assert.equal(res.body.issue_title, "Title");
        assert.equal(res.body.issue_text, "text");
        assert.equal(res.body.created_by, "Functional test");
        assert.equal(res.body.assigned_to, "Chai");
        assert.equal(res.body.status_text, "In QA");
        assert.isTrue(res.body.open);
        assert.isString(res.body._id);

        assert.equal(res.body.created_on, res.body.updated_on);

        done();
      });
  });

  test("Test POST request for only required fields", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);

        assert.equal(res.body.issue_title, "Title");
        assert.equal(res.body.issue_text, "text");
        assert.equal(res.body.created_by, "Functional test");

        done();
      });
  });

  test("Test POST request with missing required fields", function(done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Title",
        // issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });

        done();
      });
  });

  test("Test GET request to fetch all issues", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        const issue = res.body[0]; // limited to the first one. Will fail otherwise because of test 3.

        assert.property(issue, "issue_title");
        assert.property(issue, "issue_text");
        assert.property(issue, "created_by");
        assert.property(issue, "assigned_to");
        assert.property(issue, "status_text");
        assert.property(issue, "created_on");
        assert.property(issue, "updated_on");
        assert.property(issue, "open");
        assert.property(issue, "_id");
        assert.property(issue, "project");

        done();
      });
  });

  test("Test GET request to fetch an issue by using one filter", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({ assigned_to: "Chai" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        res.body.forEach(issue => {
          assert.equal(issue.assigned_to, "Chai");
        });

        done();
      });
  });

  test("Test GET request to fetch an issue by using multiple filters", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({
        open: true,
        assigned_to: "Chai",
        issue_text: "text"
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        res.body.forEach(issue => {
          assert.equal(issue.open, true);
          assert.equal(issue.assigned_to, "Chai");
          assert.equal(issue.issue_text, "text");
        });

        done();
      });
  });

  test("Test PUT request to update one field on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Update issue test",
        issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {
        const issueId = res.body._id;

        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: issueId,
            issue_text: "updated issue text"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'issue successfully updated', _id: issueId });

            done();
          });
      });
  });

  test("Test PUT request to update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Update issue test",
        issue_text: "text",
        created_by: "Functional test",
        status_text: "status",
        assigned_to: "John"
      })
      .end(function (err, res) {
        const issueId = res.body._id;

        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: issueId,
            issue_text: "updated issue text",
            status_text: "updated status",
            assigned_to: "Joe"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'issue successfully updated', _id: issueId });

            done();
          });
      });
  });

  test("Test PUT request to update an issue w/o providing id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Update issue test",
        issue_text: "text",
        created_by: "Functional test",
      })
      .end(function (err, res) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            issue_text: "updated issue text"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing id' });

            done();
          });
      });
  });

  test("Test PUT request to update an issue w/o updating fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Update issue test",
        issue_text: "text",
        created_by: "Functional test",
      })
      .end(function (err, res) {
        const issueId = res.body._id

        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: issueId
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'fields are empty', _id: issueId });

            done();
          });
      });
  });

  test("Test PUT request to update an issue with invalid id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Update issue test",
        issue_text: "text",
        created_by: "Functional test",
      })
      .end(function (err, res) {
        const issueId = "thisIsInvalid"

        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: issueId,
            issue_text: "updated text"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'issue was not found', _id: issueId });

            done();
          });
      });
  });

  test("Test DELETE to delete an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {
        const issueId = res.body._id

        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
            _id: issueId
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: 'issue successfully deleted', _id: issueId });

            done();
          });
      });
  });

  test("Test DELETE to delete an issue with invalid id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {
        const issueId = "thisIsInvalid"

        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
            _id: issueId
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'could not delete issue', _id: issueId });

            done();
          });
      });
  });

  test("Test DELETE to delete an issue with missing id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional test"
      })
      .end(function (err, res) {

        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({
            issue_text: "updated text"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { error: 'missing id' });

            done();
          });
      });
  });

});
