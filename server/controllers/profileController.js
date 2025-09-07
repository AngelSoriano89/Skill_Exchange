// controllers/profileController.js

const User = require('../models/User');

// Obtener un perfil por ID
exports.getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar el perfil del usuario autenticado
exports.updateProfile = async (req, res) => {
  const { name, bio, skills_to_offer, skills_to_learn } = req.body;
  const profileFields = {};
  if (name) profileFields.name = name;
  if (bio) profileFields.bio = bio;
  if (skills_to_offer) profileFields.skills_to_offer = skills_to_offer;
  if (skills_to_learn) profileFields.skills_to_learn = skills_to_learn;

  if (req.file) {
    profileFields.avatar = req.file.path;
  }

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Añadir una nueva habilidad
exports.addSkill = async (req, res) => {
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