// ============================================================================
// SCRIPT PARA VERIFICAR VARIABLES DE ENTORNO
// ============================================================================

require('dotenv').config();

console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===\n');

const requiredEnvVars = {
  'MONGO_URI': process.env.MONGO_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
  'PORT': process.env.PORT,
  'NODE_ENV': process.env.NODE_ENV
};

const optionalEnvVars = {
  'CLIENT_URL': process.env.CLIENT_URL,
  'FRONTEND_URL': process.env.FRONTEND_URL,
  'CLIENT_URLS': process.env.CLIENT_URLS
};

console.log('📋 VARIABLES REQUERIDAS:');
console.log('========================');
let allRequiredPresent = true;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = key === 'JWT_SECRET' && value ? '[PRESENTE]' : (value || '[NO CONFIGURADA]');
  console.log(`${status} ${key}: ${displayValue}`);
  if (!value) allRequiredPresent = false;
});

console.log('\n📋 VARIABLES OPCIONALES:');
console.log('=========================');
Object.entries(optionalEnvVars).forEach(([key, value]) => {
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${key}: ${value || '[NO CONFIGURADA]'}`);
});

console.log('\n🔍 ANÁLISIS:');
console.log('=============');

if (!allRequiredPresent) {
  console.log('❌ PROBLEMA: Faltan variables de entorno requeridas');
  console.log('   Crea un archivo .env en la carpeta server/ con:');
  console.log('   MONGO_URI=tu_conexion_mongodb');
  console.log('   JWT_SECRET=tu_secreto_jwt_muy_seguro');
  console.log('   PORT=5000');
  console.log('   NODE_ENV=development');
} else {
  console.log('✅ Todas las variables requeridas están configuradas');
}

if (requiredEnvVars.JWT_SECRET && requiredEnvVars.JWT_SECRET.length < 32) {
  console.log('⚠️  ADVERTENCIA: JWT_SECRET debería tener al menos 32 caracteres');
}

if (requiredEnvVars.MONGO_URI && !requiredEnvVars.MONGO_URI.includes('mongodb')) {
  console.log('⚠️  ADVERTENCIA: MONGO_URI no parece ser válida');
}

console.log('\n🚀 PARA EJECUTAR ESTE SCRIPT:');
console.log('node debug-env.js');

console.log('\n=== FIN DE VERIFICACIÓN ===');
