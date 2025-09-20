const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: [
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
      message: '{VALUE} no es una categoría válida'
    },
    index: true, // ✅ Para filtrar por categoría rápidamente
  },
  level: {
    type: String,
    required: [true, 'El nivel es requerido'],
    enum: {
      values: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
      message: '{VALUE} no es un nivel válido'
    },
    default: 'Principiante',
    index: true, // ✅ Para filtrar por nivel
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ✅ CORREGIDO: Capitalizado para consistencia
    required: [true, 'El usuario es requerido'],
    index: true, // ✅ Para obtener skills por usuario
  },
  tags: [{
    type: String,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres'],
    trim: true,
    validate: {
      validator: function(tag) {
        return tag.length >= 2; // Mínimo 2 caracteres por tag
      },
      message: 'Cada tag debe tener al menos 2 caracteres'
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true, // ✅ Para mostrar solo skills activos
  },
  // ✅ AGREGADO: Campo para marcar como destacado
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  timeCommitment: {
    type: String,
    enum: {
      values: ['1-2 horas/semana', '3-5 horas/semana', '6-10 horas/semana', 'Más de 10 horas/semana', 'Flexible'],
      message: '{VALUE} no es un compromiso de tiempo válido'
    },
    default: 'Flexible',
  },
  preferredFormat: {
    type: String,
    enum: {
      values: ['Presencial', 'Virtual', 'Ambos'],
      message: '{VALUE} no es un formato válido'
    },
    default: 'Ambos',
  },
  // ✅ MEJORADO: Estructura de ubicación más detallada
  location: {
    city: {
      type: String,
      default: '',
      maxlength: [100, 'La ciudad no puede exceder 100 caracteres'],
      trim: true,
    },
    country: {
      type: String,
      default: '',
      maxlength: [100, 'El país no puede exceder 100 caracteres'],
      trim: true,
    },
    // ✅ AGREGADO: Coordenadas para futuras funcionalidades
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere', // Para búsquedas geoespaciales
      validate: {
        validator: function(coords) {
          return coords.length === 0 || (coords.length === 2 && 
            coords[0] >= -180 && coords[0] <= 180 && // longitud
            coords[1] >= -90 && coords[1] <= 90);    // latitud
        },
        message: 'Coordenadas inválidas [longitud, latitud]'
      }
    }
  },
  images: [{
    type: String,
    validate: {
      validator: function(imagePath) {
        // Validar que sea una ruta válida o URL
        return /^(\/uploads\/|https?:\/\/)/.test(imagePath) || imagePath.length === 0;
      },
      message: 'Ruta de imagen inválida'
    }
  }],
  // ✅ Sistema de rating para skills
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'El rating no puede ser menor a 0'],
    max: [5, 'El rating no puede ser mayor a 5'],
    index: true, // ✅ Para ordenar por rating
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
  // ✅ AGREGADO: Estadísticas de visualizaciones
  views: {
    type: Number,
    default: 0,
    min: [0, 'Las visualizaciones no pueden ser negativas'],
  },
  // ✅ AGREGADO: Precio para habilidades premium (funcionalidad futura)
  pricing: {
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, 'El precio no puede ser negativo'],
      default: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'MXN', 'COP', 'ARS'],
      default: 'USD',
    }
  },
  // ✅ AGREGADO: Requisitos y qué incluye
  requirements: [{
    type: String,
    maxlength: [100, 'Cada requisito no puede exceder 100 caracteres'],
    trim: true,
  }],
  includes: [{
    type: String,
    maxlength: [100, 'Cada inclusión no puede exceder 100 caracteres'],
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // ✅ Para ordenar por fecha
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // ✅ AGREGADO: Campo para rastrear cuando fue promocionado por última vez
  lastPromotedAt: {
    type: Date,
    default: null,
  }
});

// ✅ MEJORADO: Middleware pre-save con validaciones adicionales
SkillSchema.pre('save', function(next) {
  // Actualizar updatedAt
  this.updatedAt = Date.now();
  
  // ✅ Validar límites de arrays
  if (this.tags && this.tags.length > 10) {
    return next(new Error('No puedes tener más de 10 tags'));
  }
  
  if (this.images && this.images.length > 5) {
    return next(new Error('No puedes tener más de 5 imágenes'));
  }
  
  if (this.requirements && this.requirements.length > 5) {
    return next(new Error('No puedes tener más de 5 requisitos'));
  }
  
  if (this.includes && this.includes.length > 10) {
    return next(new Error('No puedes tener más de 10 inclusiones'));
  }
  
  // ✅ Limpiar arrays vacíos y duplicados
  ['tags', 'requirements', 'includes'].forEach(field => {
    if (this[field]) {
      this[field] = [...new Set(this[field].filter(item => item && item.trim().length > 0))];
    }
  });
  
  // ✅ Limpiar imágenes inválidas
  if (this.images) {
    this.images = this.images.filter(img => img && img.trim().length > 0);
  }
  
  // ✅ Validar que si es premium, tenga precio
  if (this.pricing.isPaid && (!this.pricing.price || this.pricing.price <= 0)) {
    return next(new Error('Las habilidades premium deben tener un precio mayor a 0'));
  }
  
  next();
});

// ✅ CORREGIDO: Índices optimizados para búsquedas
SkillSchema.index({ user: 1 });
SkillSchema.index({ category: 1, isActive: 1 });
SkillSchema.index({ level: 1, isActive: 1 });
SkillSchema.index({ isActive: 1, averageRating: -1 });
SkillSchema.index({ isFeatured: 1, isActive: 1 });
SkillSchema.index({ createdAt: -1 });
SkillSchema.index({ views: -1 });
SkillSchema.index({ 'pricing.isPaid': 1 });

// ✅ Índices compuestos para consultas complejas
SkillSchema.index({ category: 1, level: 1, isActive: 1 });
SkillSchema.index({ 'location.city': 1, isActive: 1 });
SkillSchema.index({ 'location.country': 1, isActive: 1 });

// ✅ CORREGIDO: Índice de texto para búsqueda full-text
SkillSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  'location.city': 'text',
  'location.country': 'text'
});

// ✅ AGREGADO: Método para incrementar vistas
SkillSchema.methods.incrementViews = function() {
  return this.constructor.updateOne(
    { _id: this._id }, 
    { $inc: { views: 1 } }
  );
};

// ✅ AGREGADO: Método para verificar si el usuario puede editarlo
SkillSchema.methods.canBeEditedBy = function(userId) {
  return this.user.toString() === userId.toString();
};

// ✅ AGREGADO: Método para promocionar skill
SkillSchema.methods.promote = function() {
  this.isFeatured = true;
  this.lastPromotedAt = new Date();
  return this.save();
};

// ✅ AGREGADO: Método para obtener URL completa de imágenes
SkillSchema.methods.getImageUrls = function(baseUrl = '') {
  if (!this.images || this.images.length === 0) return [];
  
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return this.images.map(image => {
    if (image.startsWith('http')) return image;
    return `${cleanBaseUrl}${image}`;
  });
};

// ✅ AGREGADO: Método estático para buscar skills
SkillSchema.statics.searchSkills = async function(filters = {}, options = {}) {
  const {
    search,
    category,
    level,
    city,
    country,
    minRating = 0,
    maxPrice,
    isPaid,
    userId,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  // Construir filtro base
  let filter = { isActive: true };
  
  // Aplicar filtros
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (country) filter['location.country'] = new RegExp(country, 'i');
  if (minRating > 0) filter.averageRating = { $gte: minRating };
  if (userId) filter.user = userId;
  
  // Filtros de precio
  if (isPaid !== undefined) filter['pricing.isPaid'] = isPaid;
  if (maxPrice !== undefined) filter['pricing.price'] = { $lte: maxPrice };
  
  // Query builder
  let queryBuilder = this.find(filter);
  
  // Búsqueda por texto
  if (search) {
    queryBuilder = queryBuilder.find({ $text: { $search: search } });
  }
  
  // Populate user info
  queryBuilder = queryBuilder.populate('user', 'name email avatar averageRating location');
  
  // Ordenamiento
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  queryBuilder = queryBuilder.sort(sortOptions);
  
  // Paginación
  const skip = (page - 1) * limit;
  queryBuilder = queryBuilder.skip(skip).limit(parseInt(limit));
  
  // Ejecutar query y contar total
  const [skills, total] = await Promise.all([
    queryBuilder.lean(),
    this.countDocuments(filter)
  ]);
  
  return {
    skills,
    pagination: {
      current: parseInt(page),
      total,
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

// ✅ AGREGADO: Método estático para obtener categorías con conteos
SkillSchema.statics.getCategoriesWithCounts = async function() {
  const categoryCounts = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return categoryCounts.map(item => ({
    category: item._id,
    count: item.count
  }));
};

// ✅ AGREGADO: Método estático para skills destacados
SkillSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isFeatured: true 
  })
  .populate('user', 'name avatar averageRating')
  .sort({ lastPromotedAt: -1, averageRating: -1 })
  .limit(limit)
  .lean();
};

// ✅ Virtual para rating formateado
SkillSchema.virtual('ratingDisplay').get(function() {
  if (this.totalRatings === 0) return 'Sin calificar';
  return `${this.averageRating.toFixed(1)} (${this.totalRatings} reseña${this.totalRatings !== 1 ? 's' : ''})`;
});

// ✅ Virtual para precio formateado
SkillSchema.virtual('priceDisplay').get(function() {
  if (!this.pricing.isPaid) return 'Gratis';
  
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'MXN': '',
    'COP': '',
    'ARS': ''
  };
  
  const symbol = currencySymbols[this.pricing.currency] || '';
  return `${symbol}${this.pricing.price}`;
});

// ✅ Virtual para ubicación completa
SkillSchema.virtual('fullLocation').get(function() {
  const city = this.location.city;
  const country = this.location.country;
  
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return 'Ubicación no especificada';
});

// ✅ Virtual para tiempo desde creación
SkillSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'hace 1 día';
  if (diffDays < 30) return `hace ${diffDays} días`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) !== 1 ? 'es' : ''}`;
  return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
});

// ✅ Virtual para nivel de popularidad basado en vistas
SkillSchema.virtual('popularityLevel').get(function() {
  if (this.views === 0) return 'nuevo';
  if (this.views < 10) return 'emergente';
  if (this.views < 50) return 'popular';
  if (this.views < 100) return 'muy popular';
  return 'trending';
});

// ✅ CORREGIDO: Incluir virtuals en JSON
SkillSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // ✅ Remover campos internos
    delete ret.__v;
    
    // ✅ Si no es el propietario, ocultar algunos campos sensibles
    if (ret.views !== undefined && process.env.HIDE_ANALYTICS === 'true') {
      delete ret.views;
    }
    
    return ret;
  }
});
SkillSchema.set('toObject', { virtuals: true });

// ✅ CORREGIDO: Usar nombre capitalizado para el modelo
module.exports = mongoose.model('Skill', SkillSchema);
