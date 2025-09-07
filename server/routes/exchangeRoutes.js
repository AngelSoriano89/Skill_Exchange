const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createExchangeRequest,
  getReceivedExchanges,
  getSentExchanges,
  getAcceptedExchanges,
  getCompletedExchanges,
  acceptExchange,
  rejectExchange,
  completeExchange,
} = require('../controllers/exchangeController');

// @route   POST api/exchanges/request
// @desc    Crear una solicitud de intercambio
// @access  Private
router.post('/request', auth, createExchangeRequest);

// @route   GET api/exchanges/received
// @desc    Obtener solicitudes de intercambio recibidas
// @access  Private
router.get('/received', auth, getReceivedExchanges);

// @route   GET api/exchanges/sent
// @desc    Obtener solicitudes de intercambio enviadas
// @access  Private
router.get('/sent', auth, getSentExchanges);

// @route   GET api/exchanges/accepted
// @desc    Obtener intercambios aceptados
// @access  Private
router.get('/accepted', auth, getAcceptedExchanges);

// @route   GET api/exchanges/completed
// @desc    Obtener intercambios completados
// @access  Private
router.get('/completed', auth, getCompletedExchanges);

// @route   POST api/exchanges/accept/:id
// @desc    Aceptar una solicitud de intercambio
// @access  Private
router.post('/accept/:id', auth, acceptExchange);

// @route   POST api/exchanges/reject/:id
// @desc    Rechazar una solicitud de intercambio
// @access  Private
router.post('/reject/:id', auth, rejectExchange);

// @route   PUT api/exchanges/complete/:id
// @desc    Marcar un intercambio como completado
// @access  Private
router.put('/complete/:id', auth, completeExchange);

module.exports = router;
