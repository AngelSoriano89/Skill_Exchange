const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const createDirectories = () => {
  const directories = ['uploads/skills', 'uploads/avatars'];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determinar el directorio según el tipo de archivo
    if (req.route.path.includes('avatar') || file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (req.route.path.includes('skill') || file.fieldname === 'skillImage') {
      uploadPath += 'skills/';
    } else {
      uploadPath += 'general/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // máximo 5 archivos
  }
});

// Middlewares específicos
const uploadSingleImage = upload.single('image');
const uploadSkillImages = upload.array('images', 5);
const uploadAvatar = upload.single('avatar');

// Middleware de manejo de errores para multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        msg: 'Archivo demasiado grande',
        error: 'El archivo no debe superar los 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        msg: 'Demasiados archivos',
        error: 'Máximo 5 archivos permitidos'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        msg: 'Campo de archivo inesperado',
        error: err.message
      });
    }
  }
  
  if (err.message === 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)') {
    return res.status(400).json({
      msg: 'Tipo de archivo no válido',
      error: err.message
    });
  }
  
  next(err);
};

// Función para eliminar archivo
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return false;
  }
};

// Función para obtener URL completa del archivo
const getFileUrl = (req, filename) => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  uploadSingleImage,
  uploadSkillImages,
  uploadAvatar,
  handleMulterError,
  deleteFile,
  getFileUrl
};
