const express = require('express');
const router = express.Router();
const { createExchangeRequest, getMyExchanges } = require('../controllers/exchangeController');
const auth = require('../middleware/auth');

// @route   POST api/exchanges/request
// @desc    Crear una solicitud de intercambio
// @access  Private
router.post('/request', auth, createExchangeRequest);

// @route   GET api/exchanges/my-requests
// @desc    Obtener solicitudes de intercambio
// @access  Private
router.get('/my-requests', auth, getMyExchanges);

module.exports = router;
