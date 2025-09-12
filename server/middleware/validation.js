const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      msg: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para autenticación
exports.validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido'),
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Validaciones para skills
exports.validateSkill = [
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  
  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn([
      'Tecnología', 'Idiomas', 'Música', 'Arte y Diseño', 'Cocina', 
      'Deportes', 'Escritura', 'Fotografía', 'Manualidades', 
      'Negocios', 'Salud y Bienestar', 'Educación', 'Otro'
    ])
    .withMessage('Categoría inválida'),
  
  body('level')
    .notEmpty()
    .withMessage('El nivel es requerido')
    .isIn(['Principiante', 'Intermedio', 'Avanzado', 'Experto'])
    .withMessage('Nivel inválido'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Cada tag debe tener máximo 30 caracteres'),
  
  body('timeCommitment')
    .optional()
    .isIn(['1-2 horas/semana', '3-5 horas/semana', '6-10 horas/semana', 'Más de 10 horas/semana', 'Flexible'])
    .withMessage('Compromiso de tiempo inválido'),
  
  body('preferredFormat')
    .optional()
    .isIn(['Presencial', 'Virtual', 'Ambos'])
    .withMessage('Formato preferido inválido'),
];

// Validaciones para intercambios
exports.validateExchangeRequest = [
  body('recipientId')
    .notEmpty()
    .withMessage('El ID del destinatario es requerido')
    .isMongoId()
    .withMessage('ID de destinatario inválido'),
  
  body('skills_to_offer')
    .isArray({ min: 1 })
    .withMessage('Debes ofrecer al menos una habilidad'),
  
  body('skills_to_learn')
    .isArray({ min: 1 })
    .withMessage('Debes especificar al menos una habilidad que quieres aprender'),
  
  body('message')
    .notEmpty()
    .withMessage('El mensaje es requerido')
    .isLength({ min: 10, max: 500 })
    .withMessage('El mensaje debe tener entre 10 y 500 caracteres'),
];

// Validaciones para calificaciones
exports.validateRating = [
  body('exchangeId')
    .notEmpty()
    .withMessage('El ID del intercambio es requerido')
    .isMongoId()
    .withMessage('ID de intercambio inválido'),
  
  body('rating')
    .notEmpty()
    .withMessage('La calificación es requerida')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 300 })
    .withMessage('El comentario no puede exceder 300 caracteres'),
];

// Validaciones para perfil
exports.validateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido'),
  
  body('location.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  
  body('location.country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El país no puede exceder 100 caracteres'),
];

// Validaciones de parámetros comunes
exports.validateObjectId = [
  body('id').isMongoId().withMessage('ID inválido'),
];
