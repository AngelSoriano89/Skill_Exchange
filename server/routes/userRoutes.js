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
const { handleMulterError } = require('../middleware/upload');

// GET /api/users - Obtener todos los usuarios
router.get('/', getUsers);

// GET /api/users/me - Obtener perfil del usuario actual
router.get('/me', auth, getLoggedInUser);

// PUT /api/users/me - Actualizar perfil del usuario actual
router.put('/me', auth, uploadAvatar, handleMulterError, updateUserProfile);

// GET /api/users/stats - Obtener estadísticas del usuario
router.get('/stats', auth, getUserStats);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', getUserById);

module.exports = router;
