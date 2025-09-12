const Skill = require('../models/Skill');
const User = require('../models/User');

// @route   POST api/skills
// @desc    Crear una nueva habilidad
// @access  Private
exports.createSkill = async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    tags,
    timeCommitment,
    preferredFormat,
    location
  } = req.body;

  try {
    // Procesar imágenes si existen
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Retornar solo el nombre del archivo, la URL completa se construirá en el frontend
        return `skills/${file.filename}`;
      });
    }

    // Procesar tags si vienen como string
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }

    // Procesar location si viene como string
    let processedLocation = { city: '', country: '' };
    if (location) {
      if (typeof location === 'string') {
        try {
          processedLocation = JSON.parse(location);
        } catch {
          processedLocation = { city: '', country: '' };
        }
      } else {
        processedLocation = location;
      }
    }

    const newSkill = new Skill({
      title,
      description,
      category,
      level,
      user: req.user.id,
      tags: processedTags,
      timeCommitment: timeCommitment || 'Flexible',
      preferredFormat: preferredFormat || 'Ambos',
      location: processedLocation,
      images: images
    });

    await newSkill.save();
    await newSkill.populate('user', 'name email avatar averageRating');
    
    res.status(201).json(newSkill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/skills
// @desc    Obtener todas las habilidades activas con filtros
// @access  Public
exports.getSkills = async (req, res) => {
  try {
    const {
      category,
      level,
      city,
      country,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = { isActive: true };

    // Aplicar filtros
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');

    let query = Skill.find(filter);

    // Búsqueda por texto
    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    // Paginación y ordenamiento
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skills = await query
      .populate('user', 'name email avatar averageRating location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Skill.countDocuments(filter);

    res.json({
      skills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/skills/my-skills
// @desc    Obtener habilidades del usuario autenticado
// @access  Private
exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/skills/:id
// @desc    Obtener una habilidad por ID
// @access  Public
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('user', 'name email avatar averageRating totalExchanges location bio');

    if (!skill) {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }

    res.json(skill);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
};

// @route   PUT api/skills/:id
// @desc    Actualizar una habilidad
// @access  Private
exports.updateSkill = async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    tags,
    timeCommitment,
    preferredFormat,
    location,
    isActive
  } = req.body;

  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }

    // Verificar que el usuario sea el propietario
    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    const skillFields = {};
    if (title) skillFields.title = title;
    if (description) skillFields.description = description;
    if (category) skillFields.category = category;
    if (level) skillFields.level = level;
    if (tags) skillFields.tags = tags;
    if (timeCommitment) skillFields.timeCommitment = timeCommitment;
    if (preferredFormat) skillFields.preferredFormat = preferredFormat;
    if (location) skillFields.location = location;
    if (typeof isActive === 'boolean') skillFields.isActive = isActive;

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: skillFields },
      { new: true }
    ).populate('user', 'name email avatar');

    res.json(skill);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
};

// @route   DELETE api/skills/:id
// @desc    Eliminar una habilidad
// @access  Private
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }

    // Verificar que el usuario sea el propietario
    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    await Skill.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Habilidad eliminada' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Habilidad no encontrada' });
    }
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/skills/categories
// @desc    Obtener todas las categorías disponibles
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      'Tecnología',
      'Idiomas',
      'Música',
      'Arte y Diseño',
      'Cocina',
      'Deportes',
      'Escritura',
      'Fotografía',
      'Manualidades',
      'Negocios',
      'Salud y Bienestar',
      'Educación',
      'Otro'
    ];

    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// @route   GET api/skills/user/:userId
// @desc    Obtener habilidades de un usuario específico
// @access  Public
exports.getSkillsByUser = async (req, res) => {
  try {
    const skills = await Skill.find({ 
      user: req.params.userId, 
      isActive: true 
    })
      .populate('user', 'name email avatar averageRating')
      .sort({ createdAt: -1 });

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.status(500).send('Error del servidor');
  }
};
