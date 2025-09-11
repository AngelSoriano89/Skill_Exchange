import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { rateExchange, getUserRatings } from '../controllers/ratingController.js';

// @route   POST /api/ratings
// @desc    Calificar un intercambio
// @access  Private
router.post('/', auth, rateExchange);

// @route   GET /api/ratings/:userId
// @desc    Obtener las calificaciones de un usuario
// @access  Public
router.get('/:userId', getUserRatings);

export default router;
