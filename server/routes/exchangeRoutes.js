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
  getMyExchanges
} = require('../controllers/exchangeController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Exchanges
 *   description: Gestión de intercambios de habilidades
 */

/**
 * @swagger
 * /exchanges/request:
 *   post:
 *     summary: Crear una solicitud de intercambio
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - skills_to_offer
 *               - skills_to_learn
 *               - message
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID del usuario destinatario
 *               skills_to_offer:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Habilidades que ofreces
 *                 example: ["JavaScript", "React"]
 *               skills_to_learn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Habilidades que quieres aprender
 *                 example: ["Python", "Django"]
 *               message:
 *                 type: string
 *                 description: Mensaje para el destinatario
 *                 example: Hola, me interesa intercambiar habilidades contigo
 *     responses:
 *       200:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/request', auth, validateExchangeRequest, handleValidationErrors, createExchangeRequest);

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

/**
 * @swagger
 * /exchanges/complete/{id}:
 *   put:
 *     summary: Marcar un intercambio como completado
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del intercambio
 *     responses:
 *       200:
 *         description: Intercambio completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
router.put('/complete/:id', auth, completeExchange);

// @route   GET api/exchanges/:id
// @desc    Obtener un intercambio específico por ID
// @access  Private
router.get('/:id', auth, getExchangeById);

module.exports = router;
