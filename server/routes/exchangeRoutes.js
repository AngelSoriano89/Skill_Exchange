const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateExchangeRequest, handleValidationErrors } = require('../middleware/validation');
const {
  createExchangeRequest,
  getReceivedExchanges,
  getSentExchanges,
  getAcceptedExchanges,
  getCompletedExchanges,
  acceptExchange,
  rejectExchange,
  completeExchange,
  getContactInfo,
} = require('../controllers/exchangeController');

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

/**
 * @swagger
 * /exchanges/received:
 *   get:
 *     summary: Obtener solicitudes de intercambio recibidas
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de intercambios recibidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 */
router.get('/received', auth, getReceivedExchanges);

/**
 * @swagger
 * /exchanges/sent:
 *   get:
 *     summary: Obtener solicitudes de intercambio enviadas
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de intercambios enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 */
router.get('/sent', auth, getSentExchanges);

/**
 * @swagger
 * /exchanges/accepted:
 *   get:
 *     summary: Obtener intercambios aceptados
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de intercambios aceptados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 */
router.get('/accepted', auth, getAcceptedExchanges);

/**
 * @swagger
 * /exchanges/completed:
 *   get:
 *     summary: Obtener intercambios completados
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de intercambios completados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 */
router.get('/completed', auth, getCompletedExchanges);

/**
 * @swagger
 * /exchanges/contact/{id}:
 *   get:
 *     summary: Obtener información de contacto de un intercambio aceptado
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
 *         description: Información de contacto del otro usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                 unlockedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Intercambio no aceptado o información no disponible
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
router.get('/contact/:id', auth, getContactInfo);

/**
 * @swagger
 * /exchanges/accept/{id}:
 *   post:
 *     summary: Aceptar una solicitud de intercambio
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
 *         description: Intercambio aceptado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
router.post('/accept/:id', auth, acceptExchange);

/**
 * @swagger
 * /exchanges/reject/{id}:
 *   post:
 *     summary: Rechazar una solicitud de intercambio
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
 *         description: Intercambio rechazado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
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

module.exports = router;
