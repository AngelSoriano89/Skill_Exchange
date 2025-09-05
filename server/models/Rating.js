const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  exchange: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'exchange',
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('rating', RatingSchema);
