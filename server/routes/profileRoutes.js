// routes/profileRoutes.js
import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/auth.js';
import { getProfileById, updateProfile, addSkill, getContactInfo } from '../controllers/profileController.js';
import multer from 'multer';

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

// @route   GET /api/profile/:id/contact
// @desc    Obtener información de contacto
// @access  Private
router.get('/:id/contact', authMiddleware, profileController.getContactInfo);

router.get("/:id", getProfileById);
router.put("/profile", updateProfile);
router.post("/profile", addSkill);
router.get("/profile", getContactInfo);

export default router;
