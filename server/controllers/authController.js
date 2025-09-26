const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, countryCode, skills_to_offer, skills_to_learn, bio } = req.body;

    // ✅ Validaciones de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ 
        msg: 'Todos los campos requeridos deben ser proporcionados',
        required: ['name', 'email', 'password']
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // ✅ Procesar habilidades de forma consistente
    const processedSkillsToOffer = Array.isArray(skills_to_offer) 
      ? skills_to_offer 
      : skills_to_offer 
        ? skills_to_offer.split(',').map(s => s.trim()).filter(s => s)
        : [];

    const processedSkillsToLearn = Array.isArray(skills_to_learn) 
      ? skills_to_learn 
      : skills_to_learn 
        ? skills_to_learn.split(',').map(s => s.trim()).filter(s => s)
        : [];

    // Crear nuevo usuario
    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.replace(/\D/g, '') : '', // Limpiar el número de teléfono
      countryCode: countryCode || '+52', // Usar el código de país proporcionado o el de México por defecto
      skills_to_offer: processedSkillsToOffer,
      skills_to_learn: processedSkillsToLearn,
      bio: bio ? bio.trim() : '',
    });

    // Hash password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // Generar JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'skill-exchange',
        audience: 'skill-exchange-users'
      },
      (err, token) => {
        if (err) {
          console.error('Error generating JWT:', err);
          return res.status(500).json({ msg: 'Error generando token de autenticación' });
        }
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Register error:', err.message);
    
    // ✅ Manejo específico de errores de validación
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Errores de validación', 
        errors 
      });
    }

    // ✅ Manejo de errores de duplicado
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
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
  try {
    const { email, password } = req.body;

    // ✅ Validaciones de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        msg: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    let user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // ✅ Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(400).json({ msg: 'Cuenta desactivada. Contacta al soporte.' });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // ✅ Actualizar último login sin disparar validaciones del modelo completo
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Generar JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'skill-exchange',
        audience: 'skill-exchange-users'
      },
      (err, token) => {
        if (err) {
          console.error('Error generating JWT:', err);
          return res.status(500).json({ msg: 'Error generando token de autenticación' });
        }
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
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
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Función para logout (limpiar token del lado cliente)
exports.logout = async (req, res) => {
  try {
    // En un sistema con blacklist de tokens, aquí se agregaría el token
    // Por ahora, simplemente confirmamos el logout
    res.json({ msg: 'Sesión cerrada exitosamente' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ AGREGADO: Función para refrescar token
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ msg: 'Token inválido' });
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'skill-exchange',
        audience: 'skill-exchange-users'
      },
      (err, token) => {
        if (err) {
          console.error('Error refreshing JWT:', err);
          return res.status(500).json({ msg: 'Error refrescando token' });
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(500).json({ 
      msg: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
