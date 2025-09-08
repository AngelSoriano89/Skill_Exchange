const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Tecnología',
      'Idiomas',
      'Música',
      'Arte y Diseño',
      'Cocina',
      'Deportes',
      'Escritura',
      'Fotografía',
      'Manualidades',
      'Negocios',
      'Salud y Bienestar',
      'Educación',
      'Otro'
    ],
  },
  level: {
    type: String,
    required: true,
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
    default: 'Principiante',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  tags: [{
    type: String,
    maxlength: 30,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  timeCommitment: {
    type: String,
    enum: ['1-2 horas/semana', '3-5 horas/semana', '6-10 horas/semana', 'Más de 10 horas/semana', 'Flexible'],
    default: 'Flexible',
  },
  preferredFormat: {
    type: String,
    enum: ['Presencial', 'Virtual', 'Ambos'],
    default: 'Ambos',
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
  },
  images: [{
    type: String, // URLs de las imágenes
  }],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar updatedAt antes de guardar
SkillSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para búsqueda eficiente
SkillSchema.index({ user: 1 });
SkillSchema.index({ category: 1 });
SkillSchema.index({ level: 1 });
SkillSchema.index({ isActive: 1 });
SkillSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Skill', SkillSchema);
