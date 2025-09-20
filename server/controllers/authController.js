const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
exports.register = async (req, res) => {
  console.log('=== REGISTER REQUEST START ===');
  console.log('Request body:', req.body);
  
  try {
    const { name, email, password, skills_to_offer, skills_to_learn, bio } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    console.log('✅ User does not exist, creating new user');

    // ✅ CORREGIDO: Procesar arrays de skills
    let processedSkillsToOffer = [];
    let processedSkillsToLearn = [];

    if (skills_to_offer) {
      if (Array.isArray(skills_to_offer)) {
        processedSkillsToOffer = skills_to_offer;
      } else if (typeof skills_to_offer === 'string') {
        processedSkillsToOffer = skills_to_offer.split(',').map(s => s.trim()).filter(s => s);
      }
    }

    if (skills_to_learn) {
      if (Array.isArray(skills_to_learn)) {
        processedSkillsToLearn = skills_to_learn;
      } else if (typeof skills_to_learn === 'string') {
        processedSkillsToLearn = skills_to_learn.split(',').map(s => s.trim()).filter(s => s);
      }
    }

    console.log('Creating new user...');
    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      skills_to_offer: processedSkillsToOffer,
      skills_to_learn: processedSkillsToLearn,
      bio: bio ? bio.trim() : '',
    });

    console.log('✅ User object created, hashing password...');

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // ✅ CAMBIADO: Token más duradero para desarrollo
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
exports.login = async (req, res) => {
  console.log('=== LOGIN REQUEST START ===');
  console.log('Request body:', { email: req.body.email, password: req.body.password ? '[PROVIDED]' : '[MISSING]' });

  try {
    const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'YES' : 'NO');
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // ✅ CAMBIADO: Token más duradero
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/auth/me
// @desc    Obtener los datos del usuario logueado
// @access  Private
exports.getLoggedInUser = async (req, res) => {
  console.log('=== GET USER REQUEST START ===');
  console.log('User ID from token:', req.user?.id);

  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('❌ User not found with ID:', req.user.id);
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    console.log('✅ User found and returned');
    console.log('=== GET USER REQUEST END ===');
    res.json(user);
  } catch (err) {
    console.log('❌ Get user error:', err);
    console.log('=== GET USER REQUEST END (ERROR) ===');
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
