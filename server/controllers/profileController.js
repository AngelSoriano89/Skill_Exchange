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
  const { skill, type } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (type === 'offer') {
      user.skills_to_offer.push(skill);
    } else if (type === 'learn') {
      user.skills_to_learn.push(skill);
    } else {
      return res.status(400).json({ msg: 'Tipo de habilidad no válido' });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};