const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');

require('dotenv').config();

const app = express();
connectDB();

app.use(express.json({ extended: false }));
app.use(cors(corsOptions));

// Definir rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
