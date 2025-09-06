// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// @route   GET api/profile/:id
// @desc    Obtener un perfil de usuario por ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   PUT api/profile/:id
// @desc    Actualizar el perfil del usuario autenticado
// @access  Private
router.put('/:id', authMiddleware, profileController.updateProfile);

// @route   POST api/profile/skills/:id
// @desc    Añadir una habilidad al perfil del usuario autenticado
// @access  Private
router.post('/skills/:id', authMiddleware, profileController.addSkill);

module.exports = router;