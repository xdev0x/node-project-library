/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';


const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true
});

mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

const Schema = mongoose.Schema;
const bookSchema = new Schema({
  title: String,
  comments: {
    type: [String], 
    default: []
  }
}, {collection: 'book'});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}).then(books => {
        return res.json(books.map(({ _id, title, comments}) => ({
          _id, 
          title, 
          commentcount: comments.length
        })));
     })
     .catch(err=>{
      if (err.message.includes('Cast to ObjectId failed')) {
        return res.send('Failed to delete books');
      } else {
        return res.status(500).json(err);
      }
     });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      console.log('req.body.title', req.body.title)
      if (!title) {
        console.log('req.body.title', 'missing required field title')
        return res.send('missing required field title');
      } else {
        const book = new Book({ title });
        book.save().then(book => {
          return res.json({ _id: book._id, title: book.title });
        })
        .catch(err=>{
          return res.status(500).json(err);
        });
      }
    })
    
    .delete(function(req, res){
      Book.deleteMany({}).then(document => {
        return res.send('complete delete successful');
     })
     .catch(err=>{
      return res.status(500).json(err);
     });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      console.log('bookid', bookid)
      Book.findById(bookid).then(book => {
        if (!book) {
          return res.send('no book exists');
        }
        let { _id, title, comments } = book;
        return res.json({ _id, title, comments });
      })
      .catch(err=>{
        if (err.message.includes('Cast to ObjectId failed')) {
          return res.send('no book exists');
        } else {
          return res.status(500).json(err);
        }
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!bookid) {
        return res.send('no book exists');
      }
      Book.findOneAndUpdate({ _id: bookid }, { $push: { comments: comment }}, { new: true }).then(book => {
        console.log('{{', bookid, book)
        if (!comment) {
          return res.send('missing required field comment');
        }
        if(book){
          let { _id, title, comments } = book;
          return res.json({ _id, title, comments });
        } else {
          return res.send('no book exists');
        }
      })
      .catch(err => {
        if (err.message.includes('Cast to ObjectId failed')) {
          return res.send('no book exists');
        } else {
          return res.status(500).json(err);
        }
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      Book.findByIdAndDelete(bookid).then(book=>{
        console.log(book)
        if(book){
          return res.send('delete successful');
        } else {
          return res.send('no book exists');
        }
      })
      .catch(err=>{
        if (err.message.includes('Cast to ObjectId failed')) {
          return res.send('no book exists');
        } else {
          return res.status(500).json(err);
        }
      })
    });
  
};
