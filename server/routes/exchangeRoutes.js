const express = require('express');
const router = express.Router();
const { 
  createExchangeRequest, 
  getMyExchanges,
  getPendingRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  completeExchange,
  getExchangeById
} = require('../controllers/exchangeController');
const auth = require('../middleware/auth');

// @route   POST api/exchanges/request
// @desc    Crear una solicitud de intercambio
// @access  Private
router.post('/request', auth, createExchangeRequest);

// @route   GET api/exchanges/my-requests
// @desc    Obtener todas las solicitudes de intercambio del usuario (enviadas y recibidas)
// @access  Private
router.get('/my-requests', auth, getMyExchanges);

// @route   GET api/exchanges/pending
// @desc    Obtener solicitudes de intercambio pendientes para el usuario actual
// @access  Private
router.get('/pending', auth, getPendingRequests);

// @route   PUT api/exchanges/accept/:id
// @desc    Aceptar una solicitud de intercambio
// @access  Private
router.put('/accept/:id', auth, acceptExchangeRequest);

// @route   PUT api/exchanges/reject/:id
// @desc    Rechazar una solicitud de intercambio
// @access  Private
router.put('/reject/:id', auth, rejectExchangeRequest);

// @route   PUT api/exchanges/complete/:id
// @desc    Marcar un intercambio como completado
// @access  Private
router.put('/complete/:id', auth, completeExchange);

// @route   GET api/exchanges/:id
// @desc    Obtener un intercambio específico por ID
// @access  Private
router.get('/:id', auth, getExchangeById);

module.exports = router;
