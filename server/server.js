const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

require('dotenv').config();

const app = express();
connectDB();

app.use(express.json({ extended: false }));
app.use(cors(corsOptions));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Ruta de bienvenida con información de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Intercambio de Habilidades',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      skills: '/api/skills',
      exchanges: '/api/exchanges',
      ratings: '/api/ratings',
      users: '/api/users',
      profile: '/api/profile'
    }
  });
});

// Definir rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Ruta de perfil (correcta)
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/ratings', ratingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
