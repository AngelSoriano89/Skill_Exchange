const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Configuración optimizada para Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opciones no necesarias en Mongoose 6+, ya están por defecto
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      
      // ✅ Opciones útiles para producción
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // ✅ Event listeners para debugging
    if (process.env.NODE_ENV === 'development') {
      mongoose.connection.on('connected', () => {
        console.log('📦 Mongoose connected to MongoDB');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('📤 Mongoose disconnected');
      });
    }
    
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    
    // ✅ Reintentar conexión en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Reintentando conexión en 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📤 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
