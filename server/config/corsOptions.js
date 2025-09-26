
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS - Verificando origin: ${origin}`);
    console.log(`🔍 CORS - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔍 CORS - FRONTEND_URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔍 CORS - CLIENT_URL: ${process.env.CLIENT_URL}`);
    
    // ✅ Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS - Request sin origin permitido');
      return callback(null, true);
    }
    
    // ✅ Lista de orígenes permitidos
    let allowedOrigins = [];
    
    if (process.env.NODE_ENV === 'production') {
      // ✅ En producción - URLs específicas
      allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
        // ✅ URL actual de Render
        'https://skill-exchange-6l3y.onrender.com',
        // ✅ Otras posibles URLs
        'https://inter-habil.onrender.com',
        'https://skill-exchange.onrender.com'
      ].filter(Boolean);
      
      console.log('🔍 CORS - Orígenes permitidos en producción:', allowedOrigins);
      
    } else {
      // ✅ En desarrollo
      allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        // ✅ También permitir producción para testing
        'https://skill-exchange-6l3y.onrender.com'
      ];
      
      console.log('🔍 CORS - Orígenes permitidos en desarrollo:', allowedOrigins);
    }

    // ✅ Verificar si el origin está permitido
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS - Origin permitido:', origin);
      return callback(null, true);
    } else {
      console.log(`❌ CORS - Origin no permitido: ${origin}`);
      console.log(`❌ CORS - Lista de permitidos:`, allowedOrigins);
      
      return callback(new Error('No permitido por CORS'));
    }
  },
  
  // ✅ Configuraciones adicionales
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ],
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
