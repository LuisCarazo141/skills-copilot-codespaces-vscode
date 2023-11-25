// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
// Create express app
const app = express();
const router = express.Router();

// Mongoose
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/comments', {useMongoClient: true, promiseLibrary: require('bluebird')})
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));

// Models
const Comment = require('./models/comment');

// Middleware
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

// Routes
router.get('/', (req, res) => {
  res.json({message: 'API Initialized!'});
});

router.route('/comments')
  .get((req, res) => {
    Comment.find((err, comments) => {
      if (err) res.send(err);
      res.json(comments);
    });
  })
  .post((req, res) => {
    const comment = new Comment();
    comment.author = req.body.author;
    comment.text = req.body.text;

    comment.save((err) => {
      if (err) res.send(err);
      res.json({message: 'Comment successfully added!'});
    });
  });

router.route('/comments/:comment_id')
  .put((req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
      if (err) res.send(err);
      (req.body.author) ? comment.author = req.body.author : null;
      (req.body.text) ? comment.text = req.body.text : null;

      comment.save((err) => {
        if (err) res.send(err);
        res.json({message: 'Comment has been updated'});
      });
    });
  })
  .delete((req, res) => {
    Comment.remove({_id: req.params.comment_id}, (err, comment) => {
      if (err) res.send(err);
      res.json({message: 'Comment has been deleted'});
    });
  });

// Register routes
app.use('/api', router);

// Start server
const port = process.env.API_PORT || 3001;
app.listen(port, () => {
  console.log(`api running on port ${port}`);
});