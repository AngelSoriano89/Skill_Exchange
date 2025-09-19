const User = require('../models/User');
const Exchange = require('../models/Exchange');

// @route   GET api/profile/:id
// @desc    Obtener un perfil por ID
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
    profileFields.avatar = req.file.filename;
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
      { new: true, runValidators: true } // 'runValidators' asegura que se apliquen las validaciones del modelo
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
  // 1. Desestructurar las propiedades del cuerpo de la solicitud
  const { skill, type } = req.body;

  // 2. Validación de datos
  if (!skill || !type) {
    return res.status(400).json({ msg: 'Skill y tipo son campos requeridos.' });
  }

  try {
    // 3. Encontrar al usuario con el ID del token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // 4. Asegurarse de que los arrays existan antes de agregar
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
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getProfileById,
  updateProfile,
  addSkill,
  getContactInfo
};
