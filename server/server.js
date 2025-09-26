const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const corsOptions = require('./config/corsOptions');

// Conectar a la base de datos
connectDB();

const app = express();

// ✅ Prefijo de API configurable
const API_PREFIX = process.env.API_PREFIX || '/api';

// ✅ Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para desarrollo
  crossOriginEmbedderPolicy: false
}));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(`${API_PREFIX}/`, limiter);

// ✅ CORS
app.use(cors(corsOptions));

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Sanitización
app.use(mongoSanitize());

// ✅ Logging middleware (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('combined'));
}

// ✅ Health check endpoint
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    status: 'ok',
    message: 'Skill Exchange API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1'
  });
});

// ✅ Static files (uploads) sin caché para evitar inconsistencias de avatar
app.use('/uploads', (req, res, next) => {
  // Evitar caché agresivo del navegador/CDN para contenidos que cambian con frecuencia
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use(`${API_PREFIX}/auth`, require('./routes/authRoutes'));
app.use(`${API_PREFIX}/users`, require('./routes/userRoutes'));
app.use(`${API_PREFIX}/exchanges`, require('./routes/exchangeRoutes'));

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      msg: 'Errores de validación',
      errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Token inválido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token expirado' });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ msg: 'Recurso duplicado' });
  }

  // Default error
  res.status(err.status || 500).json({
    msg: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    msg: `Ruta ${req.originalUrl} no encontrada` 
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}${API_PREFIX}/health`);
});

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});
