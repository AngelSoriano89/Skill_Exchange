const mongoose = require('mongoose');
require('dotenv').config();

// Cargar variables de entorno
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Conexión a la base de datos
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/interhabil';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado...');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
};

// Función para agregar el campo countryCode a los usuarios existentes
const addCountryCodeToUsers = async () => {
  try {
    await connectDB();
    
    // Obtener el modelo de usuario
    const User = require('../models/User');
    
    // Actualizar todos los usuarios que no tengan el campo countryCode
    const result = await User.updateMany(
      { countryCode: { $exists: false } },
      { $set: { countryCode: '+52' } } // Establecer el código de país por defecto
    );
    
    console.log(`Migración completada. ${result.nModified} usuarios actualizados.`);
    process.exit(0);
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  }
};

// Ejecutar la migración
addCountryCodeToUsers();
