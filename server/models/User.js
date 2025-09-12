const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  experience: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Profesional'],
    default: 'Principiante',
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
  phone: {
    type: String,
    default: '',
  },
  location: {
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    coordinates: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
  },
  avatar: {
    type: String,
    default: '',
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalExchanges: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  preferredContactMethods: [{
    type: String,
    enum: ['email', 'phone'],
  }],
  date: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('user', UserSchema);
