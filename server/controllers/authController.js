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

    // ✅ AGREGADO: Validaciones básicas
    if (!name || !email || !password) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ 
        msg: 'Nombre, email y contraseña son requeridos',
        missing: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // ✅ AGREGADO: Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ msg: 'Formato de email inválido' });
    }

    // ✅ AGREGADO: Validar longitud de contraseña
    if (password.length < 6) {
      console.log('❌ Password too short:', password.length);
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
    }

    console.log('✅ Basic validation passed');
    console.log('Checking if user exists with email:', email);

    let user = await User.findOne({ email });
    if (user) {
      console.log('❌ User already exists:', email);
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

    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      skills_to_offer: processedSkillsToOffer,
      skills_to_learn: processedSkillsToLearn,
      bio: bio ? bio.trim() : '',
    });

    console.log('✅ User object created, hashing password...');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log('✅ Password hashed, saving user...');
    
    await user.save();
    console.log('✅ User saved successfully with ID:', user.id);

    // ✅ AGREGADO: Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ msg: 'Configuración del servidor incompleta' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    console.log('✅ Creating JWT token...');
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // ✅ CAMBIADO: Token más duradero para desarrollo
      (err, token) => {
        if (err) {
          console.log('❌ JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creando token de autenticación' });
        }
        console.log('✅ Registration successful for user:', email);
        console.log('=== REGISTER REQUEST END ===');
        res.json({ token });
      }
    );
  } catch (err) {
    console.log('❌ Registration error:', err);
    console.log('Error stack:', err.stack);
    console.log('=== REGISTER REQUEST END (ERROR) ===');
    
    // ✅ MEJORADO: Manejo específico de errores de MongoDB
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ msg: 'Errores de validación', errors });
    }
    
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    // ✅ AGREGADO: Validaciones básicas
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ msg: 'Email y contraseña son requeridos' });
    }

    console.log('✅ Basic validation passed');
    console.log('Looking for user with email:', email);

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    console.log('✅ User found, comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'YES' : 'NO');
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // ✅ AGREGADO: Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ msg: 'Configuración del servidor incompleta' });
    }

    console.log('✅ Password correct, creating JWT token...');
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
        if (err) {
          console.log('❌ JWT signing error:', err);
          return res.status(500).json({ msg: 'Error creando token de autenticación' });
        }
        console.log('✅ Login successful for user:', email);
        console.log('=== LOGIN REQUEST END ===');
        res.json({ token });
      }
    );
  } catch (err) {
    console.log('❌ Login error:', err);
    console.log('Error stack:', err.stack);
    console.log('=== LOGIN REQUEST END (ERROR) ===');
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
