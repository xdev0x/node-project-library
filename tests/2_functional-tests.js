/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

let _id;

suite('Functional Tests', function() {

  suite('You can send a POST request to /api/books', function(){
    test('Test POST /api/books with title', function(done) {
      chai.request(server)
      .post('/api/books')
      .send({ title: 'POST book'})
      .end((error, response) => {
          assert.equal(response.status, 200);
          const body = response.body;
          _id = body._id;
          assert.isDefined(body._id, 'book should have an id');
          assert.equal(body.title, 'POST book', 'book should have the title sent');
          done();
      }).timeout(5500);
    })
    test('Test POST /api/books without title', function(done) {
      chai.request(server)
      .post('/api/books')
      .send({})
      .end((error, response) => {
          assert.equal(response.status, 200);
          const body = response.text;
          assert.equal(body, 'missing required field title');
          done();
      }).timeout(5500);
    })
  })
  
  suite('You can send a GET request to /api/books', function(){
    test('The JSON response will be an array of objects with each object (book) containing title, _id, and commentcount properties', function(done) {
      chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          console.log('res.body==>',res.body)
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
    }).timeout(5500);
  })

  suite('You can send a GET request to /api/books/{_id} to retrieve a single object of a book', function(){
    test('book containing the properties title, _id, and a comments', function(done) {
      chai.request(server)
      .get('/api/books/' + _id)
      .end(function(error, response){
        console.log('res.body==>',response.body)
        assert.equal(response.status, 200);
        assert.equal(response.body.title, 'POST book');
        assert.isArray(response.body.comments);
        done();
      }).timeout(5500);
    })
    test('If no book is found, return the string no book exists', function(done) {
      chai.request(server)
      .get('/api/books/12345')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      }).timeout(5500);
    })
  })

  suite('You can send a POST request containing comment as the form body data to /api/books/{_id} to add a comment to a book.', function(){
    test('returned book response', function(done) {
      chai.request(server)
      .post('/api/books/' + _id)
      .send({ comment: 'A great book' })
      .end(function(error, response){
        console.log('response A great book', response.body, response.status, response.text)
        assert.equal(response.status, 200);
        assert.equal(response.body.title, 'POST book');
        assert.isAtLeast(response.body.comments.length, 1);
        done();
      }).timeout(5500);
    })
    test('If comment is not included in the request, return the string missing required field comment', function(done) {
      chai.request(server)
      .post('/api/books/' + _id)
      .send({})
      .end(function(error, response){
        let body = response.text;
        assert.equal(response.status, 200);
        assert.equal(body, 'missing required field comment');
        done();
      }).timeout(5500);
    })
    test('If no book is found, return the string no book exists', function(done) {
      chai.request(server)
      .post('/api/books/7868gkghil')
      .send({})
      .end(function(error, response){
        let body = response.text;
        assert.equal(response.status, 200);
        assert.equal(body, 'no book exists');
        done();
      }).timeout(5500);
    })
  })

  suite('You can send a DELETE request to /api/books', function(){
    test('The returned response will be the string delete successful if successful.', function(done) {
      chai.request(server)
      .delete('/api/books/' + _id)
      .send({})
      .end(function(error, response){
        let body = response.text;
        assert.equal(response.status, 200);
        assert.equal(body, 'delete successful');
        done();
      }).timeout(5000);
    })
    test('You can send a DELETE request to /api/books to delete all books in the database.', function(done) {
      chai.request(server)
      .delete('/api/books/')
      .send({})
      .end(function(error, response){
        console.log('==>>', response.text, response.status)
        let body = response.text;
        assert.equal(response.status, 200);
        assert.equal(body, 'complete delete successful');
        done();
      }).timeout(5000);
    })
  })

});