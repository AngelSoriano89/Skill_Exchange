const Rating = require('../models/Rating');
const Exchange = require('../models/Exchange');
const User = require('../models/User');
const Skill = require('../models/Skill');

// @route   POST /api/ratings
// @desc    Calificar un intercambio
// @access  Private
export const rateExchange = async (req, res) => {
  const { exchangeId, rating, comment } = req.body;
  
  try {
    // Verificar que el intercambio existe y está completado
    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }

    if (exchange.status !== 'completed') {
      return res.status(400).json({ msg: 'Solo puedes calificar intercambios completados' });
    }

    // Verificar que el usuario es parte del intercambio
    if (exchange.sender.toString() !== req.user.id && exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado para calificar este intercambio' });
    }

    // Comprobar si ya calificó
    const existingRating = await Rating.findOne({ exchange: exchangeId, rater: req.user.id });
    if (existingRating) {
      return res.status(400).json({ msg: 'Ya has calificado este intercambio' });
    }

    // Determinar quién está siendo calificado
    const ratedUserId = exchange.sender.toString() === req.user.id 
      ? exchange.recipient 
      : exchange.sender;

    // Crear nuevo rating
    const newRating = new Rating({
      exchange: exchangeId,
      rater: req.user.id,
      rating,
      comment: comment || '',
    });

    await newRating.save();
    await newRating.populate('rater', 'name avatar');
    await newRating.populate('exchange', 'sender recipient');

    // Actualizar el estado del intercambio
    if (exchange.sender.toString() === req.user.id) {
      exchange.ratings.senderRated = true;
    } else {
      exchange.ratings.recipientRated = true;
    }
    await exchange.save();

    // Actualizar rating promedio del usuario calificado y skill si aplica
    await updateUserRating(ratedUserId);
    
    // Si hay skill asociada, actualizar su rating
    if (exchange.skill) {
      await updateSkillRating(exchange.skill);
    }

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET /api/ratings/user/:userId
// @desc    Obtener las calificaciones recibidas por un usuario
// @access  Public
export const getUserRatings = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Buscar intercambios donde el usuario fue sender o recipient
    const exchanges = await Exchange.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: 'completed'
    });

    const exchangeIds = exchanges.map(exchange => exchange._id);

    // Buscar ratings de esos intercambios donde el usuario NO es el que califica
    const ratings = await Rating.find({
      exchange: { $in: exchangeIds },
      rater: { $ne: userId }
    })
      .populate('rater', 'name avatar')
      .populate('exchange', 'sender recipient skill')
      .sort({ date: -1 });

    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET /api/ratings/exchange/:exchangeId
// @desc    Obtener ratings de un intercambio específico
// @access  Private
exports.getExchangeRatings = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) {
      return res.status(404).json({ msg: 'Intercambio no encontrado' });
    }

    // Verificar que el usuario es parte del intercambio
    if (exchange.sender.toString() !== req.user.id && exchange.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    const ratings = await Rating.find({ exchange: req.params.exchangeId })
      .populate('rater', 'name avatar')
      .sort({ date: -1 });

    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT /api/ratings/:id
// @desc    Actualizar una calificación
// @access  Private
exports.updateRating = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    let ratingRecord = await Rating.findById(req.params.id);

    if (!ratingRecord) {
      return res.status(404).json({ msg: 'Calificación no encontrada' });
    }

    // Verificar que el usuario es el autor de la calificación
    if (ratingRecord.rater.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    const updateFields = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;

    ratingRecord = await Rating.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('rater', 'name avatar');

    // Recalcular ratings después de la actualización
    const exchange = await Exchange.findById(ratingRecord.exchange);
    const ratedUserId = exchange.sender.toString() === req.user.id 
      ? exchange.recipient 
      : exchange.sender;
    
    await updateUserRating(ratedUserId);
    
    if (exchange.skill) {
      await updateSkillRating(exchange.skill);
    }

    res.json(ratingRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   DELETE /api/ratings/:id
// @desc    Eliminar una calificación
// @access  Private
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ msg: 'Calificación no encontrada' });
    }

    // Verificar que el usuario es el autor de la calificación
    if (rating.rater.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    // Obtener información del intercambio antes de eliminar
    const exchange = await Exchange.findById(rating.exchange);
    const ratedUserId = exchange.sender.toString() === req.user.id 
      ? exchange.recipient 
      : exchange.sender;

    await Rating.findByIdAndRemove(req.params.id);

    // Actualizar estado del intercambio
    if (exchange.sender.toString() === req.user.id) {
      exchange.ratings.senderRated = false;
    } else {
      exchange.ratings.recipientRated = false;
    }
    await exchange.save();

    // Recalcular ratings
    await updateUserRating(ratedUserId);
    
    if (exchange.skill) {
      await updateSkillRating(exchange.skill);
    }

    res.json({ msg: 'Calificación eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET /api/ratings/my-ratings
// @desc    Obtener calificaciones hechas por el usuario autenticado
// @access  Private
exports.getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ rater: req.user.id })
      .populate('exchange', 'sender recipient skill')
      .sort({ date: -1 });

    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Función auxiliar para actualizar el rating promedio del usuario
async function updateUserRating(userId) {
  try {
    // Buscar todos los intercambios donde el usuario participó
    const exchanges = await Exchange.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: 'completed'
    });

    const exchangeIds = exchanges.map(exchange => exchange._id);

    // Buscar todas las calificaciones recibidas
    const ratings = await Rating.find({
      exchange: { $in: exchangeIds },
      rater: { $ne: userId }
    });

    if (ratings.length > 0) {
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      await User.findByIdAndUpdate(userId, {
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: ratings.length
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        averageRating: 0,
        totalRatings: 0
      });
    }
  } catch (err) {
    console.error('Error updating user rating:', err);
  }
}

// Función auxiliar para actualizar el rating promedio de una skill
async function updateSkillRating(skillId) {
  try {
    // Buscar intercambios relacionados con esta skill
    const exchanges = await Exchange.find({
      skill: skillId,
      status: 'completed'
    });

    const exchangeIds = exchanges.map(exchange => exchange._id);

    // Buscar ratings de estos intercambios
    const ratings = await Rating.find({
      exchange: { $in: exchangeIds }
    });

    if (ratings.length > 0) {
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      await Skill.findByIdAndUpdate(skillId, {
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings: ratings.length,
        totalExchanges: exchanges.length
      });
    } else {
      await Skill.findByIdAndUpdate(skillId, {
        averageRating: 0,
        totalRatings: 0,
        totalExchanges: exchanges.length
      });
    }
  } catch (err) {
    console.error('Error updating skill rating:', err);
  }
}
