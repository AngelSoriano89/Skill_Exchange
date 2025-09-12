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
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  },
  contactInfo: {
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
    },
    senderContactInfo: {
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
    recipientContactInfo: {
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
  },
  exchangeDetails: {
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    estimatedDuration: {
      type: String,
      enum: ['1 semana', '2 semanas', '1 mes', '2 meses', '3+ meses', 'Flexible'],
      default: 'Flexible',
    },
    meetingPreference: {
      type: String,
      enum: ['Presencial', 'Virtual', 'Ambos'],
      default: 'Ambos',
    },
  },
  ratings: {
    senderRated: {
      type: Boolean,
      default: false,
    },
    recipientRated: {
      type: Boolean,
      default: false,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar updatedAt antes de guardar
ExchangeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('exchange', ExchangeSchema);
