// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const multer = require('multer');

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // La carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// @route   GET api/profile/:id
// @desc    Obtener un perfil de usuario por ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   PUT api/profile/:id
// @desc    Actualizar el perfil del usuario autenticado
// @access  Private
router.put('/:id', authMiddleware, upload.single('avatar'), profileController.updateProfile);

module.exports = router;
