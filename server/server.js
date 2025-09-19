const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');

require('dotenv').config();

const app = express();

// Conectar a la base de datos
connectDB();

// CORS debe ir ANTES de cualquier otra configuración de middleware
app.use(cors(corsOptions));

// Middleware para parsing del body
app.use(express.json({ extended: false, limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (imágenes de avatares y skills)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de logging para debug (opcional, puedes removerlo en producción)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Definir rutas de API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));
app.use('/api/profile', require('./routes/profileRoutes')); // ✅ HABILITADO
app.use('/api/ratings', require('./routes/ratingRoutes'));  // ✅ HABILITADO

// Manejo de errores 404 para rutas API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    msg: 'Ruta de API no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Servir aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Skill Exchange API funcionando correctamente',
      environment: 'development',
      timestamp: new Date().toISOString(),
      availableRoutes: [
        'GET /api/test',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'GET /api/users',
        'GET /api/users/me',
        'PUT /api/users/me',
        'GET /api/users/:id',
        'GET /api/skills',
        'POST /api/skills',
        'GET /api/skills/categories',
        'GET /api/exchanges/my-requests',
        'POST /api/exchanges/request',
        'PUT /api/exchanges/accept/:id',
        'GET /api/profile/:id',
        'PUT /api/profile/:id',
        'POST /api/ratings',
        'GET /api/ratings/user/:userId'
      ]
    });
  });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ 
      msg: 'Error de CORS: Origin no permitido',
      origin: req.get('origin')
    });
  }
  
  // Error de parsing JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ msg: 'Invalid JSON' });
  }

  // Error de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      msg: 'Archivo demasiado grande',
      maxSize: '5MB'
    });
  }
  
  res.status(500).json({ 
    msg: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
  console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🔧 Prueba la API en: http://localhost:${PORT}/api/test`);
  console.log(`📋 Lista completa de rutas en: http://localhost:${PORT}/`);
});
