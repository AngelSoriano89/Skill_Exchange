const User = require('../models/User');

// @route   GET api/users
// @desc    Obtener todos los usuarios con un filtro de búsqueda opcional
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let users = await User.find().select('-password');
    
    if (search) {
      const regex = new RegExp(search, 'i');
      users = users.filter(user => 
        user.skills_to_offer.some(skill => skill.match(regex)) ||
        user.skills_to_learn.some(skill => skill.match(regex))
      );
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
    res.status(500).send('Error del servidor');
  }
};
