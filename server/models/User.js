const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save', async function (next) {
  // Solo encripta si la contraseña ha sido modificada (al crear o actualizar)
  if (!this.isModified('password')) {
    next();
  }
  
  // Generar un "salt" (cadena aleatoria) para la encriptación
  const salt = await bcrypt.genSalt(10);
  
  // Hashear la contraseña usando el salt y reemplazarla en el documento
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('user', UserSchema);
