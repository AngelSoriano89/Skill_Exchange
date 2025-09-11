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
  languages: [
    {
      type: String,
    },
  ],
  interests: [
    {
      type: String,
    },
  ],
  avatar: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('user', UserSchema);
