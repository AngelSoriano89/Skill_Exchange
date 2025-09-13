const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Exchange = require('../models/Exchange');

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/avatars';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// @route   GET api/profile/:id
// @desc    Obtener un perfil de usuario por ID
// @access  Public
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/profile/:id
// @desc    Actualizar el perfil del usuario autenticado
// @access  Private
const updateProfile = async (req, res) => {
  if (req.params.id !== req.user.id) {
    return res.status(401).json({ msg: 'No autorizado para actualizar este perfil' });
  }

  const { name, bio, skills_to_offer, skills_to_learn } = req.body;
  const profileFields = {};
  if (name) profileFields.name = name;
  if (bio) profileFields.bio = bio;
  
  // Convertir las cadenas de habilidades en arrays y limpiarlas
  if (skills_to_offer) {
    profileFields.skills_to_offer = skills_to_offer.split(',').map(skill => skill.trim());
  }
  if (skills_to_learn) {
    profileFields.skills_to_learn = skills_to_learn.split(',').map(skill => skill.trim());
  }

  // Guardar el nombre del archivo del avatar subido
  if (req.file) {
    profileFields.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Actualizar el usuario y devolver el objeto sin el password
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   POST api/profile/skills
// @desc    Añadir una nueva habilidad
// @access  Private
const addSkill = async (req, res) => {
  const { skill, type } = req.body;

  if (!skill || !type) {
    return res.status(400).json({ msg: 'Skill y tipo son campos requeridos.' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (type === 'offer') {
      if (!user.skills_to_offer) user.skills_to_offer = [];
      user.skills_to_offer.push(skill);
    } else if (type === 'learn') {
      if (!user.skills_to_learn) user.skills_to_learn = [];
      user.skills_to_learn.push(skill);
    } else {
      return res.status(400).json({ msg: 'Tipo de habilidad no válido' });
    }

    await user.save();
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/profile/:id/contact
// @desc    Obtener información de contacto de un usuario para un intercambio aceptado
// @access  Private
const getContactInfo = async (req, res) => {
  try {
    const userToContact = await User.findById(req.params.id).select('name email phone');

    if (!userToContact) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar si existe un intercambio aceptado entre los dos usuarios
    const acceptedExchange = await Exchange.findOne({
      $or: [
        { sender: req.user.id, recipient: userToContact._id, status: 'accepted' },
        { sender: userToContact._id, recipient: req.user.id, status: 'accepted' },
      ],
    });

    if (!acceptedExchange) {
      return res.status(403).json({ msg: 'Acceso denegado. El intercambio debe ser aceptado para ver el contacto.' });
    }

    res.json({
      user: userToContact,
      exchangeId: acceptedExchange._id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Rutas
router.get('/:id', getProfileById);
router.put('/:id', auth, upload.single('avatar'), updateProfile);
router.post('/skills', auth, addSkill);
router.get('/:id/contact', auth, getContactInfo);

module.exports = router;
