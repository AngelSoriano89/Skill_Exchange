const User = require('../models/User');

// @route   POST api/skills
// @desc    Añadir una habilidad al perfil del usuario
// @access  Private
exports.addSkill = async (req, res) => {
  const { skill, type } = req.body; // type puede ser 'offer' o 'learn'

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (type === 'offer') {
      if (!user.skills_to_offer.includes(skill)) {
        user.skills_to_offer.push(skill);
      }
    } else if (type === 'learn') {
      if (!user.skills_to_learn.includes(skill)) {
        user.skills_to_learn.push(skill);
      }
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
