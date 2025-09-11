const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getLoggedInUser, 
  getUserById,
  updateUserProfile,
  getUserStats,
  uploadAvatar
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Obtener todos los usuarios con búsqueda opcional
// @access  Public
router.get('/', getUsers);

// @route   GET api/users/me
// @desc    Obtener el perfil del usuario actual
// @access  Private
router.get('/me', auth, getLoggedInUser);

// @route   PUT api/users/me
// @desc    Actualizar el perfil del usuario actual (con upload de avatar)
// @access  Private
router.put('/me', auth, uploadAvatar, updateUserProfile);

// @route   GET api/users/stats
// @desc    Obtener estadísticas del usuario actual
// @access  Private
router.get('/stats', auth, getUserStats);

// @route   GET api/users/:id
// @desc    Obtener el perfil de un usuario por su ID
// @access  Public
router.get('/:id', getUserById);

module.exports = router;
