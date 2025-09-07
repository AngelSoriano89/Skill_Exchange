const User = require('../models/User');

// @route   GET api/users/search
// @desc    Obtener todos los usuarios con un filtro de búsqueda de habilidades
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { skill } = req.query; // Se corrige el parámetro a 'skill'
    let query = {};

    if (skill) {
      const regex = new RegExp(skill, 'i');
      query = {
        $or: [
          { skills_to_offer: { $in: [regex] } },
          { skills_to_learn: { $in: [regex] } },
        ],
      };
    }
    
    const users = await User.find(query).select('-password');
    
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
    res.status(500).send('Error del servidor');
  }
};
