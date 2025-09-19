const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // ✅ AGREGADO: Limpiar espacios en blanco
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // ✅ AGREGADO: Convertir a minúsculas
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'], // ✅ AGREGADO: Validación regex
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // ✅ AGREGADO: Longitud mínima
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
    trim: true, // ✅ AGREGADO: Limpiar espacios
  },
  phone: {
    type: String,
    default: '',
    trim: true, // ✅ AGREGADO: Limpiar espacios
  },
  location: {
    type: String,
    default: '',
    trim: true, // ✅ AGREGADO: Limpiar espacios
    maxlength: 100, // ✅ AGREGADO: Límite de longitud
  },
  experience: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Profesional'],
    default: 'Principiante',
  },
  skills_to_offer: [{
    type: String,
    trim: true, // ✅ AGREGADO: Limpiar espacios en cada skill
    maxlength: 50, // ✅ AGREGADO: Límite por skill
  }],
  skills_to_learn: [{
    type: String,
    trim: true, // ✅ AGREGADO: Limpiar espacios en cada skill
    maxlength: 50, // ✅ AGREGADO: Límite por skill
  }],
  languages: [{
    type: String,
    trim: true, // ✅ AGREGADO: Limpiar espacios
    maxlength: 30, // ✅ AGREGADO: Límite por idioma
  }],
  interests: [{
    type: String,
    trim: true, // ✅ AGREGADO: Limpiar espacios
    maxlength: 30, // ✅ AGREGADO: Límite por interés
  }],
  avatar: {
    type: String,
    default: '',
    trim: true, // ✅ AGREGADO: Limpiar espacios
  },
  // ✅ AGREGADO: Campos para sistema de rating
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalExchanges: {
    type: Number,
    default: 0,
    min: 0,
  },
  // ✅ AGREGADO: Estado del usuario
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false, // Para futuras funcionalidades de verificación
  },
  // ✅ AGREGADO: Timestamps mejorados
  lastLogin: {
    type: Date,
    default: null,
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

// ✅ AGREGADO: Middleware para actualizar updatedAt
UserSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// ✅ AGREGADO: Índices para optimizar búsquedas
// UserSchema.index({ email: 1 });
UserSchema.index({ name: 1 });
UserSchema.index({ skills_to_offer: 1 });
UserSchema.index({ skills_to_learn: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ averageRating: -1 });
UserSchema.index({ isActive: 1 });

// ✅ AGREGADO: Método para obtener el nombre completo del avatar
UserSchema.methods.getAvatarUrl = function(baseUrl = '') {
  if (!this.avatar) return null;
  if (this.avatar.startsWith('http')) return this.avatar;
  return `${baseUrl}${this.avatar}`;
};

// ✅ AGREGADO: Método para verificar si el usuario puede ser contactado
UserSchema.methods.canBeContactedBy = function(otherUserId) {
  // Lógica para verificar si existe un intercambio aceptado
  // Se implementará en el controlador, pero el método está disponible
  return true;
};

// ✅ AGREGADO: Virtual para el número total de habilidades
UserSchema.virtual('totalSkills').get(function() {
  return (this.skills_to_offer?.length || 0) + (this.skills_to_learn?.length || 0);
});

// ✅ AGREGADO: Asegurar que los virtuals se incluyan en JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Mantener nombre en minúscula para consistencia
module.exports = mongoose.model('user', UserSchema);
