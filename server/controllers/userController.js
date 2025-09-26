const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para subida de avatares
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
  }
});

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: fileFilter,
});

// @route   GET api/users
// @desc    Obtener todos los usuarios con filtro de búsqueda mejorado
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { search, type } = req.query;
    
    // Obtener todos los usuarios (sin contraseña)
    let users = await User.find().select('-password').sort({ date: -1 });
    
    // Si hay término de búsqueda, filtrar resultados
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      
      users = users.filter(user => {
        // Búsqueda por nombre (siempre incluida)
        const nameMatch = user.name && user.name.toLowerCase().includes(searchTerm);
        
        // Búsqueda por habilidades ofrecidas
        const skillsOfferedMatch = user.skills_to_offer && 
          user.skills_to_offer.some(skill => 
            skill.toLowerCase().includes(searchTerm)
          );
        
        // Búsqueda por habilidades que quiere aprender
        const skillsWantedMatch = user.skills_to_learn && 
          user.skills_to_learn.some(skill => 
            skill.toLowerCase().includes(searchTerm)
          );
        
        // Búsqueda por bio (si existe)
        const bioMatch = user.bio && user.bio.toLowerCase().includes(searchTerm);
        
        // Aplicar filtro según el tipo de búsqueda
        switch (type) {
          case 'skills_offered':
            return skillsOfferedMatch;
          case 'skills_wanted':
            return skillsWantedMatch;
          case 'name':
            return nameMatch;
          default:
            // Búsqueda general (incluye todo)
            return nameMatch || skillsOfferedMatch || skillsWantedMatch || bioMatch;
        }
      });
    }
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/users/me
// @desc    Obtener el perfil del usuario actual
// @access  Private
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/users/:id
// @desc    Obtener el perfil de un usuario por su ID
// @access  Public
exports.getUserById = async (req, res) => {
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

// Middleware para el upload de avatar
exports.uploadAvatar = upload.single('avatar');

// @route   PUT api/users/me
// @desc    Actualizar el perfil del usuario actual
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      phone, 
      countryCode,
      location, 
      experience,
      skills_to_offer, 
      skills_to_learn,
      languages,
      interests
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Eliminar avatar anterior si se sube uno nuevo
    if (req.file && user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Actualizar campos básicos
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone.replace(/\D/g, ''); // Limpiar el número de teléfono
    if (countryCode !== undefined) user.countryCode = countryCode;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;

    // Actualizar arrays (vienen como strings JSON)
    if (skills_to_offer !== undefined) {
      try {
        user.skills_to_offer = JSON.parse(skills_to_offer);
      } catch (e) {
        user.skills_to_offer = [];
      }
    }
    
    if (skills_to_learn !== undefined) {
      try {
        user.skills_to_learn = JSON.parse(skills_to_learn);
      } catch (e) {
        user.skills_to_learn = [];
      }
    }
    
    if (languages !== undefined) {
      try {
        user.languages = JSON.parse(languages);
      } catch (e) {
        user.languages = [];
      }
    }
    
    if (interests !== undefined) {
      try {
        user.interests = JSON.parse(interests);
      } catch (e) {
        user.interests = [];
      }
    }

    // Actualizar avatar si se subió uno nuevo
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    // Devolver usuario actualizado sin contraseña
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/users/stats
// @desc    Obtener estadísticas del usuario actual
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const Exchange = require('../models/Exchange');
    
    // Contar intercambios del usuario
    const totalExchanges = await Exchange.countDocuments({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    });
    
    const completedExchanges = await Exchange.countDocuments({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      status: 'completed'
    });
    
    const pendingRequests = await Exchange.countDocuments({
      recipient: req.user.id,
      status: 'pending'
    });
    
    const acceptedExchanges = await Exchange.countDocuments({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      status: 'accepted'
    });

    const user = await User.findById(req.user.id);
    const skillsOffered = user.skills_to_offer ? user.skills_to_offer.length : 0;
    const skillsWanted = user.skills_to_learn ? user.skills_to_learn.length : 0;

    res.json({
      totalExchanges,
      completedExchanges,
      pendingRequests,
      acceptedExchanges,
      skillsOffered,
      skillsWanted
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
