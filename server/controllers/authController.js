const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, skills_to_offer, skills_to_learn, bio } = req.body;

  try {
    console.log('Registration attempt for email:', email);
    console.log('Registration data:', { name, email, password: password ? '[PROVIDED]' : '[MISSING]', skills_to_offer, skills_to_learn, bio });

    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    console.log('Creating new user...');
    user = new User({
      name,
      email,
      password,
      skills_to_offer,
      skills_to_learn,
      bio,
    });

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully with ID:', user.id);

    const payload = {
      user: {
        id: user.id,
      },
    };

    console.log('Creating JWT token for new user...');
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        console.log('Registration successful for user:', email);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email);
    console.log('Request body:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });

    // Validar que se proporcionen email y password
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ msg: 'Email y contraseña son requeridos' });
    }

    let user = await User.findOne({ email });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'YES' : 'NO');
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    console.log('Creating JWT token...');
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          throw err;
        }
        console.log('Login successful for user:', email);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// @route   GET api/auth/me
// @desc    Obtener los datos del usuario logueado
// @access  Private
exports.getLoggedInUser = async (req, res) => {
  try {
    // req.user viene del authMiddleware, que valida el token y añade el usuario a la petición.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
