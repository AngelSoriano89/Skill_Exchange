const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Exchange = require('../models/Exchange');

// ✅ CORREGIDO: Configuración de multer mejorada y segura
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    
    // ✅ MEJORADO: Crear directorio de forma segura
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // ✅ MEJORADO: Nombre de archivo más seguro
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = path.extname(sanitizedOriginalName).toLowerCase();
    
    // ✅ VALIDAR extensión
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Tipo de archivo no permitido'), false);
    }
    
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${extension}`);
  },
});

// ✅ MEJORADO: Configuración de multer más robusta
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Solo 1 archivo
    fields: 10, // Máximo 10 campos
  },
  fileFilter: (req, file, cb) => {
    // ✅ VALIDACIONES MEJORADAS
    console.log('Processing file:', file.originalname, file.mimetype);
    
    // Verificar tipo MIME
    const allowedMimes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp'
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)'), false);
    }
    
    // Verificar tamaño del nombre del archivo
    if (file.originalname.length > 100) {
      return cb(new Error('Nombre de archivo demasiado largo'), false);
    }
    
    cb(null, true);
  }
});

// ✅ MEJORADO: Middleware de manejo de errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          msg: 'Archivo demasiado grande', 
          maxSize: '5MB' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          msg: 'Demasiados archivos', 
          maxFiles: 1 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          msg: 'Campo de archivo inesperado',
          expectedField: 'avatar'
        });
      default:
        return res.status(400).json({ 
          msg: 'Error al subir archivo', 
          error: err.message 
        });
    }
  }
  
  if (err.message.includes('Tipo de archivo no permitido') || 
      err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({ 
      msg: 'Tipo de archivo no válido',
      allowedTypes: ['JPG', 'PNG', 'GIF', 'WebP']
    });
  }
  
  next(err);
};

// @route   GET api/profile/:id
// @desc    Obtener un perfil de usuario por ID
// @access  Public
const getProfileById = async (req, res) => {
  try {
    // ✅ MEJORADO: Validar ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }
    
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean(); // ✅ OPTIMIZACIÓN: usar lean()
      
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // ✅ AGREGADO: Solo mostrar usuarios activos a no-propietarios
    if (!user.isActive && req.user?.id !== req.params.id) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // ✅ AGREGADO: Información adicional si es usuario autenticado
    if (req.user && req.user.id === req.params.id) {
      // Es el propio usuario, devolver información completa
      const userWithStats = await User.aggregate([
        { $match: { _id: user._id } },
        {
          $lookup: {
            from: 'exchanges',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$sender', '$$userId'] },
                      { $eq: ['$recipient', '$$userId'] }
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ],
            as: 'exchangeStats'
          }
        }
      ]);
      
      if (userWithStats.length > 0) {
        user.exchangeStats = userWithStats[0].exchangeStats;
      }
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error getting profile by id:', err.message);
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   PUT api/profile/:id
// @desc    Actualizar el perfil del usuario autenticado
// @access  Private
const updateProfile = async (req, res) => {
  // ✅ MEJORADO: Validar autorización
  if (req.params.id !== req.user.id) {
    return res.status(401).json({ msg: 'No autorizado para actualizar este perfil' });
  }

  try {
    const { 
      name, 
      bio, 
      phone, 
      location, 
      experience, 
      skills_to_offer, 
      skills_to_learn,
      languages,
      interests 
    } = req.body;
    
    // ✅ AGREGADO: Construir objeto de actualización de forma segura
    const updateFields = {};
    
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({ msg: 'El nombre debe tener al menos 2 caracteres' });
      }
      updateFields.name = name.trim();
    }
    
    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({ msg: 'La biografía no puede exceder 500 caracteres' });
      }
      updateFields.bio = bio.trim();
    }
    
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (experience !== undefined) updateFields.experience = experience;
    
    // ✅ MEJORADO: Procesar arrays de habilidades
    if (skills_to_offer !== undefined) {
      try {
        const skillsArray = typeof skills_to_offer === 'string' 
          ? JSON.parse(skills_to_offer) 
          : skills_to_offer;
        updateFields.skills_to_offer = Array.isArray(skillsArray) 
          ? skillsArray.map(s => s.trim()).filter(s => s.length > 0).slice(0, 20)
          : [];
      } catch (e) {
        return res.status(400).json({ msg: 'Formato inválido para habilidades a ofrecer' });
      }
    }
    
    if (skills_to_learn !== undefined) {
      try {
        const skillsArray = typeof skills_to_learn === 'string' 
          ? JSON.parse(skills_to_learn) 
          : skills_to_learn;
        updateFields.skills_to_learn = Array.isArray(skillsArray) 
          ? skillsArray.map(s => s.trim()).filter(s => s.length > 0).slice(0, 20)
          : [];
      } catch (e) {
        return res.status(400).json({ msg: 'Formato inválido para habilidades a aprender' });
      }
    }
    
    if (languages !== undefined) {
      try {
        const languagesArray = typeof languages === 'string' 
          ? JSON.parse(languages) 
          : languages;
        updateFields.languages = Array.isArray(languagesArray) 
          ? languagesArray.map(l => l.trim()).filter(l => l.length > 0).slice(0, 10)
          : [];
      } catch (e) {
        return res.status(400).json({ msg: 'Formato inválido para idiomas' });
      }
    }
    
    if (interests !== undefined) {
      try {
        const interestsArray = typeof interests === 'string' 
          ? JSON.parse(interests) 
          : interests;
        updateFields.interests = Array.isArray(interestsArray) 
          ? interestsArray.map(i => i.trim()).filter(i => i.length > 0).slice(0, 10)
          : [];
      } catch (e) {
        return res.status(400).json({ msg: 'Formato inválido para intereses' });
      }
    }

    // ✅ MEJORADO: Manejo de avatar mejorado
    if (req.file) {
      // Eliminar avatar anterior si existe
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(currentUser.avatar));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      updateFields.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // ✅ MEJORADO: Actualizar con validaciones
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        context: 'query' // Para validaciones personalizadas
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    
    // ✅ MEJORADO: Manejo específico de errores de validación
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Errores de validación', 
        errors 
      });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   POST api/profile/skills
// @desc    Añadir una nueva habilidad
// @access  Private
const addSkill = async (req, res) => {
  const { skill, type } = req.body;

  // ✅ MEJORADO: Validaciones más robustas
  if (!skill || !type) {
    return res.status(400).json({ 
      msg: 'Skill y tipo son campos requeridos',
      required: { skill: 'string', type: 'offer|learn' }
    });
  }

  if (!['offer', 'learn'].includes(type)) {
    return res.status(400).json({ 
      msg: 'Tipo de habilidad inválido',
      validTypes: ['offer', 'learn']
    });
  }

  const cleanSkill = skill.trim();
  if (cleanSkill.length < 2 || cleanSkill.length > 50) {
    return res.status(400).json({ 
      msg: 'La habilidad debe tener entre 2 y 50 caracteres' 
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // ✅ MEJORADO: Verificar duplicados y límites
    const targetArray = type === 'offer' ? user.skills_to_offer : user.skills_to_learn;
    
    if (targetArray && targetArray.includes(cleanSkill)) {
      return res.status(400).json({ msg: 'Esta habilidad ya está en tu lista' });
    }
    
    if (targetArray && targetArray.length >= 20) {
      return res.status(400).json({ msg: `Máximo 20 habilidades permitidas para ${type === 'offer' ? 'ofrecer' : 'aprender'}` });
    }

    // ✅ USAR updateOne para mejor performance
    const updateField = type === 'offer' ? 'skills_to_offer' : 'skills_to_learn';
    const result = await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { [updateField]: cleanSkill } }, // $addToSet previene duplicados automáticamente
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Devolver usuario actualizado
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error adding skill:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @route   GET api/profile/:id/contact
// @desc    Obtener información de contacto de un usuario para un intercambio aceptado
// @access  Private
const getContactInfo = async (req, res) => {
  try {
    // ✅ MEJORADO: Validar ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }

    const userToContact = await User.findById(req.params.id)
      .select('name email phone isActive')
      .lean();

    if (!userToContact || !userToContact.isActive) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // ✅ OPTIMIZADO: Buscar intercambio aceptado con mejor query
    const acceptedExchange = await Exchange.findOne({
      $or: [
        { sender: req.user.id, recipient: req.params.id, status: 'accepted' },
        { sender: req.params.id, recipient: req.user.id, status: 'accepted' },
        { sender: req.user.id, recipient: req.params.id, status: 'completed' },
        { sender: req.params.id, recipient: req.user.id, status: 'completed' },
      ],
    }).lean();

    if (!acceptedExchange) {
      return res.status(403).json({ 
        msg: 'Acceso denegado. El intercambio debe ser aceptado para ver el contacto.',
        hint: 'Primero debes tener un intercambio aceptado con este usuario'
      });
    }

    res.json({
      user: {
        name: userToContact.name,
        email: userToContact.email,
        phone: userToContact.phone || null
      },
      exchangeId: acceptedExchange._id,
      exchangeStatus: acceptedExchange.status
    });
  } catch (err) {
    console.error('Error getting contact info:', err.message);
    
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de usuario inválido' });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ APLICAR MIDDLEWARE: Orden correcto
router.get('/:id', getProfileById);
router.put('/:id', auth, upload.single('avatar'), handleMulterError, updateProfile);
router.post('/skills', auth, addSkill);
router.get('/:id/contact', auth, getContactInfo);

module.exports = router;
