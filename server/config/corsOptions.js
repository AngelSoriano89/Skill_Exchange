// ✅ CORREGIDO: Configuración CORS dinámica y robusta
const corsOptions = {
  origin: function (origin, callback) {
    // ✅ Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // ✅ Lista de orígenes permitidos según el entorno
    let allowedOrigins = [];
    
    if (process.env.NODE_ENV === 'production') {
      // ✅ En producción, usar variables de entorno
      const productionOrigins = [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.CLIENT_URLS
      ].filter(Boolean);
      
      // ✅ Expandir CLIENT_URLS si tiene múltiples valores separados por coma
      productionOrigins.forEach(envVar => {
        if (envVar.includes(',')) {
          allowedOrigins.push(...envVar.split(',').map(url => url.trim()));
        } else {
          allowedOrigins.push(envVar.trim());
        }
      });
      
      // ✅ Fallback si no hay variables configuradas
      if (allowedOrigins.length === 0) {
        console.warn('⚠️ No se encontraron orígenes configurados para producción');
        allowedOrigins = ['https://localhost:3000']; // Fallback básico
      }
    } else {
      // ✅ En desarrollo, permitir orígenes locales comunes
      allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
      ];
    }
    
    // ✅ Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('CORS Check:', {
        origin,
        allowedOrigins,
        allowed: allowedOrigins.includes(origin)
      });
    }
    
    // ✅ Verificar si el origen está permitido
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`❌ CORS: Origin "${origin}" no permitido. Orígenes válidos:`, allowedOrigins);
      callback(new Error(`CORS: Origin "${origin}" no permitido por la política CORS`));
    }
  },
  
  // ✅ Credenciales habilitadas para autenticación
  credentials: true,
  
  // ✅ Código de éxito para requests OPTIONS
  optionsSuccessStatus: 200,
  
  // ✅ Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // ✅ Headers permitidos (incluyendo custom headers)
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Client-Type',
    'X-Client-Version'
  ],
  
  // ✅ Headers expuestos al cliente
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Remaining'
  ],
  
  // ✅ Cache del preflight request (24 horas)
  maxAge: 24 * 60 * 60
};

// ✅ AGREGADO: Función helper para validar configuración CORS
const validateCorsConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const hasValidOrigins = [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      process.env.CLIENT_URLS
    ].some(Boolean);
    
    if (!hasValidOrigins) {
      console.error('❌ ERROR: No se han configurado orígenes válidos para producción');
      console.error('   Configura al menos una de estas variables:');
      console.error('   - CLIENT_URL');
      console.error('   - FRONTEND_URL');
      console.error('   - CLIENT_URLS (separadas por comas)');
      process.exit(1);
    }
  }
  
  console.log(`✅ CORS configurado correctamente para ${process.env.NODE_ENV || 'development'}`);
};

// ✅ Validar configuración al cargar el módulo
validateCorsConfig();

module.exports = corsOptions;
