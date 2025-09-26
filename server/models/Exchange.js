const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORREGIDO: Capitalizado para consistencia
    required: true,
    index: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORREGIDO: Capitalizado para consistencia
    required: true,
    index: true,
  },
  skills_to_offer: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Cada habilidad no puede exceder 50 caracteres'],
  }],
  skills_to_learn: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Cada habilidad no puede exceder 50 caracteres'],
  }],
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'El mensaje debe tener al menos 10 caracteres'],
    maxlength: [500, 'El mensaje no puede exceder 500 caracteres'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected', 'completed'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pending',
    required: true,
    index: true,
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null,
    // Asegurar que el modelo Skill esté registrado
    get: function() {
      if (this.populated('skill')) return this.populated('skill');
      return this.get('skill');
    },
    set: function(val) {
      this.set('skill', val);
    }
  },
  contactInfo: {
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
      default: null,
    }
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
      enum: {
        values: ['1 semana', '2 semanas', '1 mes', '2 meses', '3+ meses', 'Flexible'],
        message: '{VALUE} no es una duración válida'
      },
      default: 'Flexible',
    },
    meetingPreference: {
      type: String,
      enum: {
        values: ['Presencial', 'Virtual', 'Ambos'],
        message: '{VALUE} no es una preferencia válida'
      },
      default: 'Ambos',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres'],
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
    senderRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating', // ✅ CORREGIDO: Capitalizado para consistencia
      default: null,
    },
    recipientRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rating', // ✅ CORREGIDO: Capitalizado para consistencia
      default: null,
    },
  },
  metadata: {
    ipAddress: {
      type: String,
      default: '',
      maxlength: 45, // ✅ IPv6 compatible
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
});

// ✅ MEJORADO: Middleware pre-save con validaciones más robustas
ExchangeSchema.pre('save', function(next) {
  // Actualizar timestamp
  this.updatedAt = Date.now();
  
  // ✅ Validar que sender y recipient sean diferentes
  if (this.sender && this.recipient && this.sender.toString() === this.recipient.toString()) {
    return next(new Error('El emisor y receptor no pueden ser el mismo usuario'));
  }
  
  // ✅ Validar que skills arrays no estén vacíos
  if (!this.skills_to_offer || this.skills_to_offer.length === 0) {
    return next(new Error('Debe especificar al menos una habilidad a ofrecer'));
  }
  
  if (!this.skills_to_learn || this.skills_to_learn.length === 0) {
    return next(new Error('Debe especificar al menos una habilidad a aprender'));
  }
  
  // ✅ Validar límite de habilidades
  if (this.skills_to_offer.length > 10) {
    return next(new Error('No puedes ofrecer más de 10 habilidades'));
  }
  
  if (this.skills_to_learn.length > 10) {
    return next(new Error('No puedes solicitar más de 10 habilidades'));
  }
  
  // ✅ Auto-unlock contact info cuando se acepta
  if (this.status === 'accepted' && !this.contactInfo.isUnlocked) {
    this.contactInfo.isUnlocked = true;
    this.contactInfo.unlockedAt = new Date();
  }
  
  // ✅ Validar transiciones de estado
  if (this.isModified('status')) {
    const validTransitions = {
      'pending': ['accepted', 'rejected'],
      'accepted': ['completed'],
      'rejected': [], // No se puede cambiar desde rejected
      'completed': [] // No se puede cambiar desde completed
    };
    
    if (this.isNew) {
      // Nuevo documento, debe ser pending
      if (this.status !== 'pending') {
        return next(new Error('Los intercambios nuevos deben tener estado "pending"'));
      }
    } else {
      // Documento existente, validar transición
      const originalDoc = this.constructor.findById(this._id);
      if (originalDoc && originalDoc.status) {
        const allowedStatuses = validTransitions[originalDoc.status] || [];
        if (!allowedStatuses.includes(this.status)) {
          return next(new Error(`No se puede cambiar de "${originalDoc.status}" a "${this.status}"`));
        }
      }
    }
  }
  
  next();
});

// ✅ CORREGIDO: Índices compuestos optimizados
ExchangeSchema.index({ sender: 1, status: 1 });
ExchangeSchema.index({ recipient: 1, status: 1 });
ExchangeSchema.index({ status: 1, date: -1 });
ExchangeSchema.index({ sender: 1, recipient: 1 });
ExchangeSchema.index({ 'metadata.source': 1 });
ExchangeSchema.index({ updatedAt: -1 }); // ✅ Para queries de "recently updated"

// ✅ AGREGADO: Índice de texto para búsqueda
ExchangeSchema.index({
  skills_to_offer: 'text',
  skills_to_learn: 'text',
  message: 'text'
});

// ✅ MEJORADO: Método para verificar si ambos usuarios han calificado
ExchangeSchema.methods.isBothRated = function() {
  return this.ratings.senderRated && this.ratings.recipientRated;
};

// ✅ MEJORADO: Método para obtener el otro usuario en el intercambio
ExchangeSchema.methods.getOtherUser = function(currentUserId) {
  if (!currentUserId) throw new Error('currentUserId es requerido');
  
  const currentUserIdStr = currentUserId.toString();
  const senderIdStr = this.sender._id ? this.sender._id.toString() : this.sender.toString();
  const recipientIdStr = this.recipient._id ? this.recipient._id.toString() : this.recipient.toString();
  
  if (senderIdStr === currentUserIdStr) {
    return this.recipient;
  } else if (recipientIdStr === currentUserIdStr) {
    return this.sender;
  } else {
    throw new Error('El usuario actual no es parte de este intercambio');
  }
};

// ✅ AGREGADO: Método para verificar si el usuario puede modificar el intercambio
ExchangeSchema.methods.canUserModify = function(userId, action) {
  const userIdStr = userId.toString();
  const senderIdStr = this.sender._id ? this.sender._id.toString() : this.sender.toString();
  const recipientIdStr = this.recipient._id ? this.recipient._id.toString() : this.recipient.toString();
  
  switch (action) {
    case 'accept':
    case 'reject':
      return recipientIdStr === userIdStr && this.status === 'pending';
    case 'cancel':
      return senderIdStr === userIdStr && this.status === 'pending';
    case 'complete':
      return (senderIdStr === userIdStr || recipientIdStr === userIdStr) && this.status === 'accepted';
    case 'view':
      return senderIdStr === userIdStr || recipientIdStr === userIdStr;
    default:
      return false;
  }
};

// ✅ AGREGADO: Método estático para obtener estadísticas
ExchangeSchema.statics.getStats = async function(userId) {
  try {
    // ✅ VALIDAR: Asegurar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID de usuario no válido');
    }

    const stats = await this.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // ✅ INICIALIZAR: Valores por defecto para todos los estados posibles
    const result = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      total: 0
    };
    
    // ✅ SUMAR: Contar por estado
    stats.forEach(stat => {
      if (stat._id && result.hasOwnProperty(stat._id)) {
        result[stat._id] = stat.count;
        result.total += stat.count;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error en getStats:', error);
    // ✅ RECUPERACIÓN: Devolver valores por defecto en caso de error
    return {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      total: 0,
      error: 'Error al calcular estadísticas'
    };
  }
};

// ✅ Virtual para verificar si está expirado (después de 30 días pendiente)
ExchangeSchema.virtual('isExpired').get(function() {
  if (this.status !== 'pending') return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.date < thirtyDaysAgo;
});

// ✅ Virtual para duración del intercambio
ExchangeSchema.virtual('duration').get(function() {
  if (!this.exchangeDetails?.startDate || !this.exchangeDetails?.endDate) return null;
  
  const start = new Date(this.exchangeDetails.startDate);
  const end = new Date(this.exchangeDetails.endDate);
  
  // Validar fechas
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid dates in exchange details:', this.exchangeDetails);
    return null;
  }
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
});

// ✅ Virtual para el estado legible en español
ExchangeSchema.virtual('statusText').get(function() {
  const statusMap = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    completed: 'Completado'
  };
  return statusMap[this.status] || this.status;
});

// ✅ CORREGIDO: Incluir virtuals en JSON y Object
ExchangeSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // ✅ Remover campos sensibles según el contexto
    if (ret.metadata && process.env.NODE_ENV === 'production') {
      delete ret.metadata.ipAddress;
      delete ret.metadata.userAgent;
    }
    return ret;
  }
});
ExchangeSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Usar nombre capitalizado para el modelo
module.exports = mongoose.model('Exchange', ExchangeSchema);
