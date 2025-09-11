import Rating from'../models/Rating.js';
import User from'../models/User.js';

// @route   POST /api/ratings
// @desc    Calificar un intercambio
// @access  Private
export const rateExchange = async (req, res) => {
  const { exchangeId, rating, comment } = req.body;
  
  try {
    // Comprobar si el rating ya existe para este intercambio por este usuario
    const existingRating = await Rating.findOne({ exchange: exchangeId, rater: req.user.id });
    if (existingRating) {
      return res.status(400).json({ msg: 'Ya has calificado este intercambio' });
    }

    // Crear un nuevo rating
    const newRating = new Rating({
      exchange: exchangeId,
      rater: req.user.id,
      rating,
      comment,
    });

    await newRating.save();
    res.json(newRating);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET /api/ratings/:userId
// @desc    Obtener las calificaciones de un usuario
// @access  Public
export const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ recipient: req.params.userId }).populate('rater', 'name');
    res.json(ratings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
