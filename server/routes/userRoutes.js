const express = require('express');
const router = express.Router();
const { getUsers, getLoggedInUser, getUserById } = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Obtener todos los usuarios
// @access  Public
router.get('/', getUsers);

// @route   GET api/users/me
// @desc    Obtener el perfil del usuario actual
// @access  Private
router.get('/me', auth, getLoggedInUser);

// @route   GET api/users/:id
// @desc    Obtener el perfil de un usuario por su ID
// @access  Public
router.get('/:id', getUserById);

module.exports = router;
