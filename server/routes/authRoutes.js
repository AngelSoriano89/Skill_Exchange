const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { register, login, getLoggedInUser } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/me
// @desc    Obtener el perfil del usuario autenticado
// @access  Private
router.get('/me', authMiddleware, getLoggedInUser);

module.exports = router;
