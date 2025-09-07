const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { rateExchange, getUserRatings } = require('../controllers/ratingController');

// @route   POST /api/ratings
// @desc    Calificar un intercambio
// @access  Private
router.post('/', auth, rateExchange);

// @route   GET /api/ratings/:userId
// @desc    Obtener las calificaciones de un usuario
// @access  Public
router.get('/:userId', getUserRatings);

module.exports = router;
