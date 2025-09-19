const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // ✅ MANTENER minúscula para consistencia
    required: true,
    index: true, // ✅ AGREGADO: Índice para optimizar búsquedas
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // ✅ MANTENER minúscula para consistencia
    required: true,
    index: true, // ✅ AGREGADO: Índice para optimizar búsquedas
  },
  skills_to_offer: [{
    type: String,
    required: true,
    trim: true, // ✅ AGREGADO: Limpiar espacios
    maxlength: 50, // ✅ AGREGADO: Límite por skill
  }],
  skills_to_learn: [{
    type: String,
    required: true,
    trim: true, // ✅ AGREGADO: Limpiar espacios
    maxlength: 50, // ✅ AGREGADO: Límite por skill
  }],
  message: {
    type: String,
    required: true,
    trim: true, // ✅ AGREGADO: Limpiar espacios
    minlength: 10, // ✅ AGREGADO: Mensaje mínimo
    maxlength: 500, // ✅ AGREGADO: Límite de mensaje
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
    required: true,
    index: true, // ✅ AGREGADO: Índice para filtrar por estado
  },
  // ✅ CORREGIDO: Referencia opcional a skill específica
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'skill', // ✅ Mantener minúscula para consistencia
    default: null,
  },
  contactInfo: {
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: null,
    },
    // ✅ SIMPLIFICADO: No almacenar info de contacto duplicada
    // La info de contacto se obtiene directamente del modelo User
  },
  exchangeDetails: {
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
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
    // ✅ AGREGADO: Notas adicionales del intercambio
    notes: {
      type: String,
      maxlength: 1000,
      default: '',
      trim: true,
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
    // ✅ AGREGADO: Referencias a las calificaciones
    senderRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rating',
      default: null,
    },
    recipientRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rating',
      default: null,
    },
  },
  // ✅ AGREGADO: Metadatos adicionales
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

// ✅ MEJORADO: Middleware para actualizar updatedAt y validaciones
ExchangeSchema.pre('save', function(next) {
  // Actualizar timestamp
  this.updatedAt = Date.now();
  
  // ✅ AGREGADO: Validar que sender y recipient sean diferentes
  if (this.sender && this.recipient && this.sender.toString() === this.recipient.toString()) {
    next(new Error('El emisor y receptor no pueden ser el mismo usuario'));
    return;
  }
  
  // ✅ AGREGADO: Validar skills arrays no vacíos
  if (!this.skills_to_offer || this.skills_to_offer.length === 0) {
    next(new Error('Debe especificar al menos una habilidad a ofrecer'));
    return;
  }
  
  if (!this.skills_to_learn || this.skills_to_learn.length === 0) {
    next(new Error('Debe especificar al menos una habilidad a aprender'));
    return;
  }
  
  // ✅ AGREGADO: Auto-unlock contact info cuando se acepta
  if (this.status === 'accepted' && !this.contactInfo.isUnlocked) {
    this.contactInfo.isUnlocked = true;
    this.contactInfo.unlockedAt = new Date();
  }
  
  next();
});

// ✅ AGREGADO: Índices compuestos para consultas comunes
ExchangeSchema.index({ sender: 1, status: 1 });
ExchangeSchema.index({ recipient: 1, status: 1 });
ExchangeSchema.index({ status: 1, date: -1 });
ExchangeSchema.index({ sender: 1, recipient: 1 });

// ✅ AGREGADO: Método para verificar si ambos usuarios han calificado
ExchangeSchema.methods.isBothRated = function() {
  return this.ratings.senderRated && this.ratings.recipientRated;
};

// ✅ AGREGADO: Método para obtener el otro usuario en el intercambio
ExchangeSchema.methods.getOtherUser = function(currentUserId) {
  const currentUserIdStr = currentUserId.toString();
  if (this.sender._id?.toString() === currentUserIdStr || this.sender.toString() === currentUserIdStr) {
    return this.recipient;
  } else {
    return this.sender;
  }
};

// ✅ AGREGADO: Virtual para verificar si está expirado (después de 30 días pendiente)
ExchangeSchema.virtual('isExpired').get(function() {
  if (this.status !== 'pending') return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.date < thirtyDaysAgo;
});

// ✅ AGREGADO: Virtual para duración del intercambio
ExchangeSchema.virtual('duration').get(function() {
  if (!this.exchangeDetails.startDate || !this.exchangeDetails.endDate) return null;
  const diffTime = Math.abs(this.exchangeDetails.endDate - this.exchangeDetails.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} días`;
});

// ✅ AGREGADO: Incluir virtuals en JSON
ExchangeSchema.set('toJSON', { virtuals: true });
ExchangeSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Mantener nombre en minúscula para consistencia
module.exports = mongoose.model('exchange', ExchangeSchema);
