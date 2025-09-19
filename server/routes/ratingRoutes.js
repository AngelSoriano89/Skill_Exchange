const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../middleware/validation');
const Rating = require('../models/Rating');
const Exchange = require('../models/Exchange');
const User = require('../models/User');

// @route   POST /api/ratings
// @desc    Calificar un intercambio
// @access  Private
const rateExchange = async (req, res) => {
  const { 
    exchangeId, 
    rating, 
    comment, 
    categories, 
    isAnonymous 
  } = req.body;
  
  try {
    // ✅ MEJORADO: Validaciones más robustas
    if (!exchangeId || !rating) {
      return res.status(400).json({ 
        msg: 'ExchangeId y rating son requeridos',
        required: ['exchangeId', 'rating']
      });
    }

    // Verificar que el intercambio existe y está completado
    const exchange = await Exchange.findById(exchangeId)
      .populate('sender recipient', 'name email')
      .lean();
      
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }

    if (exchange.status !== 'completed') {
      return res.status(400).json({ 
        msg: 'Solo puedes calificar intercambios completados',
        currentStatus: exchange.status
      });
    }

    // Verificar que el usuario es parte del intercambio
    const isParticipant = exchange.sender._id.toString() === req.user.id || 
                         exchange.recipient._id.toString() === req.user.id;
    
    if (!isParticipant) {
      return res.status(401).json({ msg: 'No autorizado para calificar este intercambio' });
    }

    // Determinar quién está siendo calificado
    const ratedUserId = exchange.sender._id.toString() === req.user.id 
      ? exchange.recipient._id 
      : exchange.sender._id;

    // Comprobar si ya calificó
    const existingRating = await Rating.findOne({ 
      exchange: exchangeId, 
      rater: req.user.id 
    });
    
    if (existingRating) {
      return res.status(400).json({ 
        msg: 'Ya has calificado este intercambio',
        ratingId: existingRating._id
      });
    }

    // ✅ AGREGADO: Validar categorías si se proporcionan
    let processedCategories = { overall: rating };
    if (categories) {
      const validCategories = ['communication', 'teaching', 'reliability'];
      validCategories.forEach(cat => {
        if (categories[cat] && categories[cat] >= 1 && categories[cat] <= 5) {
          processedCategories[cat] = categories[cat];
        }
      });
    }

    // ✅ AGREGADO: Metadata de la petición
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      source: req.get('X-Client-Type') || 'web'
    };

    // Crear nuevo rating
    const newRating = new Rating({
      exchange: exchangeId,
      rater: req.user.id,
      rated: ratedUserId,
      rating,
      comment: comment?.trim() || '',
      categories: processedCategories,
      isAnonymous: isAnonymous || false,
      metadata
    });

    await newRating.save();

    // ✅ MEJORADO: Usar transacción para atomicidad
    const session = await Rating.startSession();
    session.startTransaction();
    
    try {
      // Actualizar el estado del intercambio
      const updateField = exchange.sender._id.toString() === req.user.id 
        ? 'ratings.senderRated' 
        : 'ratings.recipientRated';
      
      const ratingField = exchange.sender._id.toString() === req.user.id 
        ? 'ratings.senderRatingId' 
        : 'ratings.recipientRatingId';

      await Exchange.updateOne(
        { _id: exchangeId },
        { 
          $set: { 
            [updateField]: true,
            [ratingField]: newRating._id
          }
        },
        { session }
      );

      // Actualizar rating promedio del usuario calificado
      await updateUserRating(ratedUserId, session);
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // ✅ OPTIMIZADO: Poblar datos antes de enviar respuesta
    await newRating.populate([
      { path: 'rater', select: 'name avatar' },
      { path: 'rated', select: 'name' },
      { path: 'exchange', select: 'skills_to_offer skills_to_learn status' }
    ]);

    res.status(201).json(newRating);
  } catch (err) {
    console.error('Error rating exchange:', err.message);
    
    // ✅ MEJORADO: Manejo específico de errores
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Errores de validación', 
        errors 
      });
    }
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de intercambio inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET /api/ratings/user/:userId
// @desc    Obtener las calificaciones recibidas por un usuario
// @access  Public
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      includeStats = false,
      minRating,
      maxRating 
    } = req.query;

    // ✅ MEJORADO: Validar ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }

    // ✅ MEJORADO: Construir filtro dinámico
    const filter = {
      rated: userId,
      isVisible: true
    };
    
    if (minRating) filter.rating = { ...filter.rating, $gte: parseInt(minRating) };
    if (maxRating) filter.rating = { ...filter.rating, $lte: parseInt(maxRating) };

    // ✅ OPTIMIZADO: Consultas en paralelo
    const skip = (page - 1) * limit;
    const [ratings, total, stats] = await Promise.all([
      Rating.find(filter)
        .populate('rater', 'name avatar isAnonymous')
        .populate('exchange', 'skills_to_offer skills_to_learn date')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      
      Rating.countDocuments(filter),
      
      // Solo calcular stats si se solicita
      includeStats === 'true' 
        ? Rating.calculateUserAverage(userId)
        : Promise.resolve(null)
    ]);

    // ✅ AGREGADO: Ocultar información de raters anónimos
    const processedRatings = ratings.map(rating => {
      if (rating.isAnonymous) {
        rating.rater = {
          name: 'Usuario Anónimo',
          avatar: null
        };
      }
      return rating;
    });

    const response = {
      ratings: processedRatings,
      pagination: {
        current: parseInt(page),
        total,
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };

    if (stats) {
      response.stats = stats;
    }

    res.json(response);
  } catch (err) {
    console.error('Error getting user ratings:', err.message);
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET /api/ratings/my-ratings
// @desc    Obtener calificaciones hechas por el usuario autenticado
// @access  Private
const getMyRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ rater: req.user.id })
        .populate('rated', 'name avatar')
        .populate('exchange', 'skills_to_offer skills_to_learn status date')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
        
      Rating.countDocuments({ rater: req.user.id })
    ]);

    res.json({
      ratings,
      pagination: {
        current: parseInt(page),
        total,
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error getting my ratings:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Actualizar una calificación
// @route   PUT /api/ratings/:id
// @desc    Actualizar una calificación propia
// @access  Private
const updateRating = async (req, res) => {
  try {
    const { rating: newRating, comment, categories } = req.body;
    
    const ratingDoc = await Rating.findById(req.params.id);
    
    if (!ratingDoc) {
      return res.status(404).json({ msg: 'Calificación no encontrada' });
    }

    // Verificar ownership
    if (ratingDoc.rater.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado para modificar esta calificación' });
    }

    // Solo permitir actualizaciones dentro de 24 horas
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (ratingDoc.date < dayAgo) {
      return res.status(400).json({ 
        msg: 'Solo puedes modificar calificaciones dentro de las primeras 24 horas' 
      });
    }

    // Actualizar campos
    if (newRating !== undefined) ratingDoc.rating = newRating;
    if (comment !== undefined) ratingDoc.comment = comment.trim();
    if (categories !== undefined) {
      ratingDoc.categories = { ...ratingDoc.categories, ...categories };
    }

    await ratingDoc.save();

    // Recalcular promedio del usuario
    await updateUserRating(ratingDoc.rated);

    await ratingDoc.populate([
      { path: 'rater', select: 'name avatar' },
      { path: 'rated', select: 'name' }
    ]);

    res.json(ratingDoc);
  } catch (err) {
    console.error('Error updating rating:', err.message);
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de calificación inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Obtener estadísticas de calificaciones
// @route   GET /api/ratings/stats/:userId
// @desc    Obtener estadísticas detalladas de calificaciones de un usuario
// @access  Public
const getUserRatingStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }

    const stats = await Rating.calculateUserAverage(userId);
    const recentRatings = await Rating.getRecentRatings(userId, 30, 5);
    
    res.json({
      ...stats,
      recentRatings
    });
  } catch (err) {
    console.error('Error getting user rating stats:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Función auxiliar para actualizar el rating promedio del usuario
async function updateUserRating(userId, session = null) {
  try {
    const stats = await Rating.calculateUserAverage(userId);
    
    const updateData = {
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings
    };

    const options = session ? { session } : {};
    
    await User.findByIdAndUpdate(userId, updateData, options);
  } catch (err) {
    console.error('Error updating user rating:', err);
  }
}

// ✅ APLICAR RUTAS
router.post('/', auth, validateRating, handleValidationErrors, rateExchange);
router.get('/user/:userId', getUserRatings);
router.get('/my-ratings', auth, getMyRatings);
router.get('/stats/:userId', getUserRatingStats);
router.put('/:id', auth, updateRating);

module.exports = router;
