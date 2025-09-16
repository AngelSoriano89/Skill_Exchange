const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Agrega aquí tu dominio de producción cuando lo tengas
      // 'https://tu-dominio-production.com'
    ];

    // Permitir requests sin origin (como Postman, aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);

    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS: Origin no permitido: ${origin}`);
      return callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies/credenciales
  optionsSuccessStatus: 200, // Para soporte de navegadores legacy
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ], // Headers permitidos
  preflightContinue: false, // Pasar control al siguiente handler después del preflight
};

module.exports = corsOptions;
