const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
// const corsOptions = require('./config/corsOptions'); // <-- ELIMINAR ESTA LÍNEA
const path = require('path');
const helmet = require('helmet'); // ✅ AGREGADO: Seguridad
const rateLimit = require('express-rate-limit'); // ✅ AGREGADO: Rate limiting

require('dotenv').config();

const app = express();

// Conectar a la base de datos
connectDB();

// ✅ CORREGIDO: Configuración CORS mejorada
const corsOptions = {
  origin: function (origin, callback) {
    // ✅ PERMITIR requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? (process.env.CLIENT_URLS || process.env.FRONTEND_URL || '').split(',').map(url => url.trim()).filter(Boolean)
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3001'
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Client-Type', 'X-Client-Version'],
  // preflightContinue: false
};

// ✅ AGREGADO: Middleware de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Para permitir uploads
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  }
}));

// ✅ AGREGADO: Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite por ventana por IP
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting solo en producción
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// CORS debe ir ANTES de cualquier otra configuración de middleware
app.use(cors(corsOptions));

app.use('/uploads', (req, res, next) => {
  // Permitir CORS para archivos estáticos
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Middleware para parsing del body
app.use(express.json({ 
  extended: false, 
  limit: process.env.JSON_LIMIT || '50mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.JSON_LIMIT || '50mb'
}));

// ✅ CORREGIDO: Servir archivos estáticos con headers apropiados
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  setHeaders: (res, path, filePath) => {
    // ✅ Headers de seguridad para archivos
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // ✅ Cache headers
    if (process.env.NODE_ENV === 'production') {
      res.set('Cache-Control', 'public, max-age=604800'); // 7 días
    }
  }
}));

// ✅ MEJORADO: Middleware de logging condicional
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
    next();
  });
}

// ✅ CORREGIDO: Ruta de health check mejorada
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Servidor funcionando correctamente', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ✅ MANTENIDO: Ruta de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente', 
    timestamp: new Date().toISOString() 
  });
});

// ✅ CORREGIDO: Definir rutas de API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes')); // ✅ DESCOMENTADO
app.use('/api/profile', require('./routes/profileRoutes')); // ✅ AGREGADO

// ✅ AGREGADO: Ruta 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    msg: 'Endpoint no encontrado',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/skills',
      'GET /api/exchanges',
      'GET /api/ratings'
    ]
  });
});

// ✅ MEJORADO: Servir aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  
  // Verificar que la carpeta build existe
  const fs = require('fs');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Carpeta client/build no encontrada. Ejecuta "npm run build" en el frontend.');
    app.get('*', (req, res) => {
      res.status(503).json({ 
        msg: 'Frontend no construido. Ejecuta npm run build en el cliente.' 
      });
    });
  }
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Skill Exchange API - Modo Desarrollo',
      docs: '/api/health',
      frontend: 'http://localhost:3000'
    });
  });
}

// ✅ MEJORADO: Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
  
  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({ 
      msg: 'CORS Error: Origen no permitido',
      origin: req.get('origin')
    });
  }
  
  // Error de JSON malformado
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      msg: 'JSON malformado en el request body' 
    });
  }
  
  // Error de límite de tamaño
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      msg: 'Archivo demasiado grande',
      limit: '10MB'
    });
  }
  
  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ 
    msg: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ MEJORADO: Puerto con fallback
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
  console.log(`📁 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

// ✅ AGREGADO: Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
