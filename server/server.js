const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');

// Importar todos los archivos de rutas de una sola vez
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');

require('dotenv').config();

const app = express();
connectDB();

// Middlewares
app.use(express.json({ extended: false }));
app.use(cors(corsOptions));

// Definir rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Ruta de perfil (correcta)
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/exchanges', exchangeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
