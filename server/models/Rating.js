const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  exchange: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exchange', // ✅ CORREGIDO: Capitalizado para consistencia
    required: [true, 'El intercambio es requerido'],
    index: true,
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORREGIDO: Capitalizado para consistencia
    required: [true, 'El calificador es requerido'],
    index: true,
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORREGIDO: Capitalizado para consistencia
    required: [true, 'El usuario calificado es requerido'],
    index: true,
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'La calificación debe ser un número entero'
    }
  },
  comment: {
    type: String,
    required: false,
    maxlength: [300, 'El comentario no puede exceder 300 caracteres'],
    trim: true,
    default: '',
  },
  // ✅ MEJORADO: Sistema de categorías más detallado
  categories: {
    communication: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
      default: null,
      validate: {
        validator: function(v) {
          return v === null || Number.isInteger(v);
        },
        message: 'La calificación debe ser un número entero'
      }
    },
    teaching: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
      default: null,
      validate: {
        validator: function(v) {
          return v === null || Number.isInteger(v);
        },
        message: 'La calificación debe ser un número entero'
      }
    },
    reliability: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
      default: null,
      validate: {
        validator: function(v) {
          return v === null || Number.isInteger(v);
        },
        message: 'La calificación debe ser un número entero'
      }
    },
    punctuality: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
      default: null,
      validate: {
        validator: function(v) {
          return v === null || Number.isInteger(v);
        },
        message: 'La calificación debe ser un número entero'
      }
    },
    overall: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
      required: [true, 'La calificación general es requerida'],
      validate: {
        validator: function(v) {
          return Number.isInteger(v);
        },
        message: 'La calificación debe ser un número entero'
      }
    }
  },
  // ✅ Estado de la calificación
  isVisible: {
    type: Boolean,
    default: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  // ✅ AGREGADO: Flag para calificaciones reportadas
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: {
    type: String,
    default: '',
    maxlength: [200, 'La razón del reporte no puede exceder 200 caracteres'],
  },
  // ✅ MEJORADO: Metadata más completa
  metadata: {
    ipAddress: {
      type: String,
      default: '',
      maxlength: 45, // IPv6 compatible
    },
    userAgent: {
      type: String,
      default: '',
      maxlength: 512,
    },
    source: {
      type: String,
      enum: {
        values: ['web', 'mobile', 'api'],
        message: '{VALUE} no es una fuente válida'
      },
      default: 'web',
    },
    // ✅ AGREGADO: Información adicional del contexto
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: {
      type: String,
      default: '',
      maxlength: 50
    }
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // ✅ AGREGADO: Campo para marcar cuando fue editado por última vez
  lastEditedAt: {
    type: Date,
    default: null,
  }
});

// ✅ MEJORADO: Middleware pre-save con validaciones más robustas
RatingSchema.pre('save', function(next) {
  // Actualizar timestamp
  this.updatedAt = Date.now();
  
  // Marcar cuando fue editado (solo si no es nuevo y se modificó)
  if (!this.isNew && this.isModified()) {
    this.lastEditedAt = Date.now();
  }
  
  // ✅ Validar que el rater no se califique a sí mismo
  if (this.rater && this.rated && this.rater.toString() === this.rated.toString()) {
    return next(new Error('No puedes calificarte a ti mismo'));
  }
  
  // ✅ Sincronizar rating con categories.overall
  if (this.categories && this.categories.overall !== undefined) {
    this.rating = this.categories.overall;
  } else if (this.rating !== undefined) {
    if (!this.categories) this.categories = {};
    this.categories.overall = this.rating;
  }
  
  // ✅ AGREGADO: Validar que el comentario no esté vacío si es obligatorio por rating bajo
  if (this.rating <= 2 && (!this.comment || this.comment.trim().length === 0)) {
    return next(new Error('Se requiere un comentario para calificaciones de 2 estrellas o menos'));
  }
  
  // ✅ AGREGADO: Limitar ediciones después de cierto tiempo
  if (!this.isNew && this.isModified() && this.date) {
    const editWindow = 24 * 60 * 60 * 1000; // 24 horas
    if (Date.now() - this.date.getTime() > editWindow) {
      return next(new Error('No se pueden editar calificaciones después de 24 horas'));
    }
  }
  
  next();
});

// ✅ CORREGIDO: Índices compuestos optimizados
RatingSchema.index({ exchange: 1, rater: 1 }, { unique: true }); // Prevenir calificaciones duplicadas
RatingSchema.index({ rated: 1, date: -1 }); // Para obtener calificaciones recibidas por fecha
RatingSchema.index({ rater: 1, date: -1 }); // Para obtener calificaciones dadas por fecha
RatingSchema.index({ rating: -1, date: -1 }); // Para filtrar por rating
RatingSchema.index({ isVisible: 1, rated: 1 }); // Para mostrar solo calificaciones visibles
RatingSchema.index({ isReported: 1 }); // ✅ Para moderación
RatingSchema.index({ 'metadata.source': 1 }); // ✅ Para analytics

// ✅ AGREGADO: Índice de texto para búsqueda en comentarios
RatingSchema.index({ comment: 'text' });

// ✅ MEJORADO: Método para verificar si el rating es reciente
RatingSchema.methods.isRecent = function(days = 30) {
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.date >= daysAgo;
};

// ✅ MEJORADO: Método para verificar si se puede editar
RatingSchema.methods.canBeEditedBy = function(userId) {
  // Solo el autor puede editar
  if (this.rater.toString() !== userId.toString()) return false;
  
  // Solo dentro del período de edición (24 horas)
  const editWindow = 24 * 60 * 60 * 1000;
  if (Date.now() - this.date.getTime() > editWindow) return false;
  
  // No se puede editar si está reportado
  if (this.isReported) return false;
  
  return true;
};

// ✅ MEJORADO: Método para obtener el rating promedio de categorías
RatingSchema.methods.getCategoryAverage = function() {
  if (!this.categories) return this.rating;
  
  const categories = this.categories;
  const validRatings = [];
  
  ['communication', 'teaching', 'reliability', 'punctuality'].forEach(category => {
    if (categories[category] !== null && categories[category] !== undefined) {
      validRatings.push(categories[category]);
    }
  });
  
  if (validRatings.length === 0) return this.rating;
  
  const sum = validRatings.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validRatings.length) * 100) / 100;
};

// ✅ AGREGADO: Método para reportar calificación
RatingSchema.methods.report = function(reason, reportedBy) {
  this.isReported = true;
  this.reportReason = reason;
  this.isVisible = false; // Ocultar automáticamente
  
  // Log del reporte (en una implementación real, esto iría a un sistema de logs)
  console.log(`Rating ${this._id} reported by ${reportedBy} for: ${reason}`);
  
  return this.save();
};

// ✅ Virtual para obtener texto del rating
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

// ✅ AGREGADO: Virtual para verificar si ha sido editado
RatingSchema.virtual('wasEdited').get(function() {
  return this.lastEditedAt !== null;
});

// ✅ AGREGADO: Virtual para tiempo desde la calificación
RatingSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'hace 1 día';
  if (diffDays < 30) return `hace ${diffDays} días`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
  return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
});

// ✅ MEJORADO: Método estático para calcular promedio de usuario
RatingSchema.statics.calculateUserAverage = async function(userId) {
  try {
    const result = await this.aggregate([
      { 
        $match: { 
          rated: new mongoose.Types.ObjectId(userId),
          isVisible: true,
          isReported: false // ✅ Excluir reportados
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: { $push: '$rating' },
          // ✅ AGREGADO: Promedios por categoría
          avgCommunication: { $avg: '$categories.communication' },
          avgTeaching: { $avg: '$categories.teaching' },
          avgReliability: { $avg: '$categories.reliability' },
          avgPunctuality: { $avg: '$categories.punctuality' }
        }
      }
    ]);
    
    if (result.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {
          communication: 0,
          teaching: 0,
          reliability: 0,
          punctuality: 0
        }
      };
    }
    
    const { 
      averageRating, 
      totalRatings, 
      ratingDistribution,
      avgCommunication,
      avgTeaching,
      avgReliability,
      avgPunctuality
    } = result[0];
    
    // Calcular distribución de ratings
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalRatings,
      ratingDistribution: distribution,
      categoryAverages: {
        communication: avgCommunication ? Math.round(avgCommunication * 100) / 100 : 0,
        teaching: avgTeaching ? Math.round(avgTeaching * 100) / 100 : 0,
        reliability: avgReliability ? Math.round(avgReliability * 100) / 100 : 0,
        punctuality: avgPunctuality ? Math.round(avgPunctuality * 100) / 100 : 0
      }
    };
  } catch (error) {
    console.error('Error calculating user average:', error);
    throw error;
  }
};

// ✅ MEJORADO: Método estático para obtener ratings recientes
RatingSchema.statics.getRecentRatings = function(userId, days = 30, limit = 10) {
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.find({
    rated: userId,
    isVisible: true,
    isReported: false,
    date: { $gte: daysAgo }
  })
  .populate('rater', 'name avatar')
  .populate('exchange', 'skills_to_offer skills_to_learn date')
  .sort({ date: -1 })
  .limit(limit)
  .lean();
};

// ✅ AGREGADO: Método estático para obtener estadísticas generales
RatingSchema.statics.getGlobalStats = async function() {
  try {
    const stats = await this.aggregate([
      { $match: { isVisible: true, isReported: false } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: { $push: '$rating' }
        }
      }
    ]);
    
    if (stats.length === 0) return null;
    
    const { totalRatings, averageRating, ratingDistribution } = stats[0];
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return {
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution: distribution
    };
  } catch (error) {
    console.error('Error getting global stats:', error);
    throw error;
  }
};

// ✅ CORREGIDO: Incluir virtuals en JSON
RatingSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // ✅ Remover campos sensibles en producción
    if (process.env.NODE_ENV === 'production') {
      if (ret.metadata) {
        delete ret.metadata.ipAddress;
        delete ret.metadata.userAgent;
      }
    }
    
    // ✅ Ocultar información si es anónimo
    if (ret.isAnonymous && ret.rater) {
      ret.rater = {
        name: 'Usuario Anónimo',
        avatar: null
      };
    }
    
    delete ret.__v;
    return ret;
  }
});
RatingSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Usar nombre capitalizado para el modelo
module.exports = mongoose.model('Rating', RatingSchema);
        
