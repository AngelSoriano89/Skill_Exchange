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
// app.use('/api/ratings', require('./routes/ratingRoutes')); // Comentado hasta que se corrija el archivo

// Servir aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Skill Exchange API funcionando correctamente' });
  });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
