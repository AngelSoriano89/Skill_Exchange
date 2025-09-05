const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  skills_to_offer: [
    {
      type: String,
    },
  ],
  skills_to_learn: [
    {
      type: String,
    },
  ],
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('exchange', ExchangeSchema);
