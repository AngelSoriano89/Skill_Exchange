const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../middleware/validation');
const {
  rateExchange,
  getUserRatings,
  getExchangeRatings,
  updateRating,
  deleteRating,
  getMyRatings
} = require('../controllers/ratingController');

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Sistema de calificaciones
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Calificar un intercambio
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exchangeId
 *               - rating
 *             properties:
 *               exchangeId:
 *                 type: string
 *                 description: ID del intercambio a calificar
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación de 1 a 5
 *               comment:
 *                 type: string
 *                 maxLength: 300
 *                 description: Comentario opcional
 *     responses:
 *       201:
 *         description: Calificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Datos inválidos o intercambio no completado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
router.post('/', auth, validateRating, handleValidationErrors, rateExchange);

/**
 * @swagger
 * /ratings/user/{userId}:
 *   get:
 *     summary: Obtener calificaciones recibidas por un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de calificaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 */
router.get('/user/:userId', getUserRatings);

/**
 * @swagger
 * /ratings/my-ratings:
 *   get:
 *     summary: Obtener calificaciones hechas por el usuario autenticado
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis calificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 */
router.get('/my-ratings', auth, getMyRatings);

/**
 * @swagger
 * /ratings/exchange/{exchangeId}:
 *   get:
 *     summary: Obtener calificaciones de un intercambio específico
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exchangeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del intercambio
 *     responses:
 *       200:
 *         description: Calificaciones del intercambio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 */
router.get('/exchange/:exchangeId', auth, getExchangeRatings);

/**
 * @swagger
 * /ratings/{id}:
 *   put:
 *     summary: Actualizar una calificación
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la calificación
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       200:
 *         description: Calificación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Calificación no encontrada
 */
router.put('/:id', auth, updateRating);

/**
 * @swagger
 * /ratings/{id}:
 *   delete:
 *     summary: Eliminar una calificación
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la calificación
 *     responses:
 *       200:
 *         description: Calificación eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Calificación no encontrada
 */
router.delete('/:id', auth, deleteRating);

module.exports = router;
