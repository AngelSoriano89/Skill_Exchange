const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    index: true, // ✅ AGREGADO: Índice para búsquedas rápidas
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    // ✅ AGREGADO: No incluir password en queries por defecto
    select: false,
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'La biografía no puede exceder 500 caracteres'],
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    // ✅ AGREGADO: Validación básica de teléfono
    validate: {
      validator: function(v) {
        // Si está vacío, es válido (opcional)
        if (!v || v.length === 0) return true;
        // Validar formato básico de teléfono internacional
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Formato de teléfono inválido'
    }
  },
  location: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'La ubicación no puede exceder 100 caracteres'],
  },
  experience: {
    type: String,
    enum: {
      values: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Profesional'],
      message: '{VALUE} no es un nivel de experiencia válido'
    },
    default: 'Principiante',
  },
  skills_to_offer: [{
    type: String,
    trim: true,
    maxlength: [50, 'Cada habilidad no puede exceder 50 caracteres'],
    // ✅ AGREGADO: Validación personalizada
    validate: {
      validator: function(skill) {
        return skill.length >= 2; // Mínimo 2 caracteres por skill
      },
      message: 'Cada habilidad debe tener al menos 2 caracteres'
    }
  }],
  skills_to_learn: [{
    type: String,
    trim: true,
    maxlength: [50, 'Cada habilidad no puede exceder 50 caracteres'],
    validate: {
      validator: function(skill) {
        return skill.length >= 2;
      },
      message: 'Cada habilidad debe tener al menos 2 caracteres'
    }
  }],
  languages: [{
    type: String,
    trim: true,
    maxlength: [30, 'Cada idioma no puede exceder 30 caracteres'],
  }],
  interests: [{
    type: String,
    trim: true,
    maxlength: [30, 'Cada interés no puede exceder 30 caracteres'],
  }],
  avatar: {
    type: String,
    default: '',
    trim: true,
    // ✅ AGREGADO: Validación de ruta de avatar
    validate: {
      validator: function(v) {
        if (!v) return true; // Vacío es válido
        // Validar que sea una ruta válida o URL
        return /^(\/uploads\/|https?:\/\/)/.test(v) || v.length === 0;
      },
      message: 'Ruta de avatar inválida'
    }
  },
  // ✅ Campos para sistema de rating
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'El rating no puede ser menor a 0'],
    max: [5, 'El rating no puede ser mayor a 5'],
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: [0, 'El total de ratings no puede ser negativo'],
  },
  totalExchanges: {
    type: Number,
    default: 0,
    min: [0, 'El total de intercambios no puede ser negativo'],
  },
  // ✅ Estado del usuario
  isActive: {
    type: Boolean,
    default: true,
    index: true, // ✅ Para filtrar usuarios activos rápidamente
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  // ✅ AGREGADO: Campos adicionales para funcionalidades futuras
  preferences: {
    receiveEmails: {
      type: Boolean,
      default: true,
    },
    publicProfile: {
      type: Boolean,
      default: true,
    },
    showPhone: {
      type: Boolean,
      default: false, // Por defecto, teléfono privado
    }
  },
  // ✅ AGREGADO: Información de verificación
  verification: {
    emailToken: {
      type: String,
      default: null,
    },
    emailTokenExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    }
  },
  // ✅ Timestamps mejorados
  lastLogin: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true, // ✅ Para ordenar por fecha de registro
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ AGREGADO: Middleware pre-save para validaciones adicionales
UserSchema.pre('save', function(next) {
  // Actualizar updatedAt solo si no es nuevo
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // ✅ Validar límites de arrays
  if (this.skills_to_offer && this.skills_to_offer.length > 20) {
    return next(new Error('No puedes tener más de 20 habilidades para ofrecer'));
  }
  
  if (this.skills_to_learn && this.skills_to_learn.length > 20) {
    return next(new Error('No puedes tener más de 20 habilidades para aprender'));
  }
  
  if (this.languages && this.languages.length > 10) {
    return next(new Error('No puedes tener más de 10 idiomas'));
  }
  
  if (this.interests && this.interests.length > 15) {
    return next(new Error('No puedes tener más de 15 intereses'));
  }
  
  // ✅ Limpiar arrays vacíos y duplicados
  ['skills_to_offer', 'skills_to_learn', 'languages', 'interests'].forEach(field => {
    if (this[field]) {
      // Remover elementos vacíos y duplicados
      this[field] = [...new Set(this[field].filter(item => item && item.trim().length > 0))];
    }
  });
  
  next();
});

// ✅ AGREGADO: Middleware pre-save para hash de password
UserSchema.pre('save', async function(next) {
  // Solo hash si el password fue modificado
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); // ✅ Salt rounds aumentados
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ MEJORADO: Índices optimizados para búsquedas
UserSchema.index({ name: 1 });
UserSchema.index({ skills_to_offer: 1 });
UserSchema.index({ skills_to_learn: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ averageRating: -1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ experience: 1 });
UserSchema.index({ date: -1 });

// ✅ AGREGADO: Índice compuesto para búsquedas complejas
UserSchema.index({ isActive: 1, averageRating: -1 });
UserSchema.index({ location: 1, isActive: 1 });

// ✅ AGREGADO: Índice de texto para búsqueda full-text
UserSchema.index({
  name: 'text',
  bio: 'text',
  skills_to_offer: 'text',
  skills_to_learn: 'text'
});

// ✅ MEJORADO: Método para obtener URL completa del avatar
UserSchema.methods.getAvatarUrl = function(baseUrl = '') {
  if (!this.avatar) return null;
  if (this.avatar.startsWith('http')) return this.avatar;
  
  // ✅ Construir URL completa
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remover trailing slash
  return `${cleanBaseUrl}${this.avatar}`;
};

// ✅ AGREGADO: Método para verificar password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// ✅ AGREGADO: Método para verificar si el usuario puede ser contactado
UserSchema.methods.canBeContactedBy = async function(otherUserId) {
  // Importar Exchange aquí para evitar dependencias circulares
  const Exchange = mongoose.model('Exchange');
  
  const acceptedExchange = await Exchange.findOne({
    $or: [
      { sender: this._id, recipient: otherUserId, status: 'accepted' },
      { sender: otherUserId, recipient: this._id, status: 'accepted' },
      { sender: this._id, recipient: otherUserId, status: 'completed' },
      { sender: otherUserId, recipient: this._id, status: 'completed' }
    ]
  });
  
  return !!acceptedExchange;
};

// ✅ AGREGADO: Método para obtener perfil público
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  // Remover campos privados
  delete userObject.password;
  delete userObject.verification;
  delete userObject.__v;
  
  // Condicional para campos sensibles según preferencias
  if (!this.preferences.showPhone) {
    delete userObject.phone;
  }
  
  if (!this.preferences.publicProfile) {
    // Si el perfil no es público, mostrar solo información básica
    return {
      _id: userObject._id,
      name: userObject.name,
      avatar: userObject.avatar,
      experience: userObject.experience,
      averageRating: userObject.averageRating,
      totalRatings: userObject.totalRatings,
      isActive: userObject.isActive
    };
  }
  
  return userObject;
};

// ✅ AGREGADO: Método estático para búsqueda avanzada
UserSchema.statics.searchUsers = async function(query, options = {}) {
  const {
    search,
    location,
    experience,
    minRating = 0,
    skills,
    page = 1,
    limit = 20,
    sortBy = 'date',
    sortOrder = 'desc'
  } = options;
  
  // Construir filtro
  let filter = { isActive: true };
  
  if (location) {
    filter.location = new RegExp(location, 'i');
  }
  
  if (experience) {
    filter.experience = experience;
  }
  
  if (minRating > 0) {
    filter.averageRating = { $gte: minRating };
  }
  
  if (skills && skills.length > 0) {
    filter.$or = [
      { skills_to_offer: { $in: skills.map(s => new RegExp(s, 'i')) } },
      { skills_to_learn: { $in: skills.map(s => new RegExp(s, 'i')) } }
    ];
  }
  
  // Query builder
  let queryBuilder = this.find(filter);
  
  // Búsqueda por texto
  if (search) {
    queryBuilder = queryBuilder.find({ $text: { $search: search } });
  }
  
  // Ordenamiento
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  queryBuilder = queryBuilder.sort(sortOptions);
  
  // Paginación
  const skip = (page - 1) * limit;
  queryBuilder = queryBuilder.skip(skip).limit(parseInt(limit));
  
  // Ejecutar query y contar total
  const [users, total] = await Promise.all([
    queryBuilder.select('-password -verification').lean(),
    this.countDocuments(filter)
  ]);
  
  return {
    users,
    pagination: {
      current: parseInt(page),
      total,
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

// ✅ Virtual para el número total de habilidades
UserSchema.virtual('totalSkills').get(function() {
  return (this.skills_to_offer?.length || 0) + (this.skills_to_learn?.length || 0);
});

// ✅ AGREGADO: Virtual para el rating formateado
UserSchema.virtual('ratingDisplay').get(function() {
  if (this.totalRatings === 0) return 'Sin calificar';
  return `${this.averageRating.toFixed(1)} (${this.totalRatings} reseña${this.totalRatings !== 1 ? 's' : ''})`;
});

// ✅ AGREGADO: Virtual para tiempo como miembro
UserSchema.virtual('memberSince').get(function() {
  const now = new Date();
  const joined = new Date(this.date);
  const diffTime = Math.abs(now - joined);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
  return `${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
});

// ✅ CORREGIDO: Incluir virtuals en JSON
UserSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Remover campos sensibles automáticamente
    delete ret.password;
    delete ret.verification;
    delete ret.__v;
    return ret;
  }
});
UserSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Usar nombre capitalizado para el modelo
module.exports = mongoose.model('User', UserSchema);
