const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  exchange: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'exchange', // ✅ CORREGIDO: minúscula para consistencia
    required: true,
    index: true, // ✅ AGREGADO: Índice para optimizar búsquedas
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // ✅ CORREGIDO: minúscula para consistencia
    required: true,
    index: true, // ✅ AGREGADO: Índice para optimizar búsquedas
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // ✅ AGREGADO: Usuario que recibe la calificación
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5'],
    validate: {
      validator: Number.isInteger,
      message: 'La calificación debe ser un número entero'
    }
  },
  comment: {
    type: String,
    required: false,
    maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
    trim: true, // ✅ AGREGADO: Limpiar espacios
  },
  // ✅ AGREGADO: Información adicional de la calificación
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // Opcional
    },
    teaching: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // Opcional
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // Opcional
    },
    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: true, // Debe coincidir con el campo 'rating'
    }
  },
  // ✅ AGREGADO: Estado de la calificación
  isVisible: {
    type: Boolean,
    default: true, // Por defecto visible
  },
  isAnonymous: {
    type: Boolean,
    default: false, // Por defecto no anónima
  },
  // ✅ AGREGADO: Metadata
  metadata: {
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web',
    },
  },
  date: {
    type: Date,
    default: Date.now,
    index: true, // ✅ AGREGADO: Índice para ordenar por fecha
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ AGREGADO: Middleware pre-save para validaciones y actualizaciones
RatingSchema.pre('save', function(next) {
  // Actualizar timestamp
  this.updatedAt = Date.now();
  
  // Validar que el rater no se califique a sí mismo
  if (this.rater && this.rated && this.rater.toString() === this.rated.toString()) {
    next(new Error('No puedes calificarte a ti mismo'));
    return;
  }
  
  // Sincronizar rating con categories.overall
  if (this.categories && this.categories.overall) {
    this.rating = this.categories.overall;
  } else if (this.rating) {
    if (!this.categories) this.categories = {};
    this.categories.overall = this.rating;
  }
  
  next();
});

// ✅ AGREGADO: Índices compuestos para consultas comunes
RatingSchema.index({ exchange: 1, rater: 1 }, { unique: true }); // Prevenir calificaciones duplicadas
RatingSchema.index({ rated: 1, date: -1 }); // Para obtener calificaciones recibidas por fecha
RatingSchema.index({ rater: 1, date: -1 }); // Para obtener calificaciones dadas por fecha
RatingSchema.index({ rating: -1, date: -1 }); // Para filtrar por rating
RatingSchema.index({ isVisible: 1, rated: 1 }); // Para mostrar solo calificaciones visibles

// ✅ AGREGADO: Método para verificar si el rating es reciente
RatingSchema.methods.isRecent = function(days = 30) {
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.date >= daysAgo;
};

// ✅ AGREGADO: Método para obtener el rating promedio de categorías
RatingSchema.methods.getCategoryAverage = function() {
  if (!this.categories) return this.rating;
  
  const categories = this.categories;
  const validRatings = [];
  
  if (categories.communication) validRatings.push(categories.communication);
  if (categories.teaching) validRatings.push(categories.teaching);
  if (categories.reliability) validRatings.push(categories.reliability);
  
  if (validRatings.length === 0) return this.rating;
  
  const sum = validRatings.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validRatings.length) * 100) / 100; // Redondear a 2 decimales
};

// ✅ AGREGADO: Virtual para obtener texto del rating
RatingSchema.virtual('ratingText').get(function() {
  const ratingTexts = {
    1: 'Muy malo',
    2: 'Malo', 
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };
  return ratingTexts[this.rating] || 'Sin calificar';
});

// ✅ AGREGADO: Método estático para calcular promedio de usuario
RatingSchema.statics.calculateUserAverage = async function(userId) {
  const result = await this.aggregate([
    { 
      $match: { 
        rated: mongoose.Types.ObjectId(userId),
        isVisible: true 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const { averageRating, totalRatings, ratingDistribution } = result[0];
  
  // Calcular distribución de ratings
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(averageRating * 100) / 100,
    totalRatings,
    ratingDistribution: distribution
  };
};

// ✅ AGREGADO: Método estático para obtener ratings recientes
RatingSchema.statics.getRecentRatings = function(userId, days = 30, limit = 10) {
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.find({
    rated: userId,
    isVisible: true,
    date: { $gte: daysAgo }
  })
  .populate('rater', 'name avatar')
  .populate('exchange', 'skills_to_offer skills_to_learn')
  .sort({ date: -1 })
  .limit(limit)
  .lean();
};

// ✅ AGREGADO: Incluir virtuals en JSON
RatingSchema.set('toJSON', { virtuals: true });
RatingSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Mantener nombre en minúscula para consistencia
module.exports = mongoose.model('rating', RatingSchema);
