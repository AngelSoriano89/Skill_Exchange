const express = require('express');
const router = express.Router();
const { 
  createExchangeRequest, 
  getMyExchanges,
  getPendingRequests,
  acceptExchangeRequest,
  rejectExchangeRequest,
  completeExchange,
  getExchangeById,
  getExchangeStats,
  cancelExchange
} = require('../controllers/exchangeController');
const auth = require('../middleware/auth');
const { validateExchangeRequest, handleValidationErrors } = require('../middleware/validation');

// ✅ AGREGADO: Middleware de validación personalizado para intercambios
const validateExchangeAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar formato ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de intercambio inválido' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ msg: 'Error de validación' });
  }
};

// ✅ AGREGADO: Middleware de logging para intercambios
const logExchangeAction = (action) => {
  return (req, res, next) => {
    console.log(`[${new Date().toISOString()}] User ${req.user?.id} attempting to ${action} exchange ${req.params.id || 'new'}`);
    next();
  };
};

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
 *               skills_to_learn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Habilidades que quieres aprender
 *               message:
 *                 type: string
 *                 description: Mensaje personalizado
 *               skillId:
 *                 type: string
 *                 description: ID de skill específica (opcional)
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Datos inválidos o solicitud duplicada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Destinatario no encontrado
 */
router.post('/request', 
  auth, 
  logExchangeAction('create'),
  validateExchangeRequest, 
  handleValidationErrors, 
  createExchangeRequest
);

/**
 * @swagger
 * /exchanges/my-requests:
 *   get:
 *     summary: Obtener mis intercambios (enviados y recibidos)
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, completed, all]
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de intercambios con paginación
 */
router.get('/my-requests', 
  auth, 
  logExchangeAction('get my exchanges'),
  getMyExchanges
);

/**
 * @swagger
 * /exchanges/pending:
 *   get:
 *     summary: Obtener solicitudes pendientes recibidas
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes
 */
router.get('/pending', 
  auth, 
  logExchangeAction('get pending requests'),
  getPendingRequests
);

/**
 * @swagger
 * /exchanges/stats:
 *   get:
 *     summary: Obtener estadísticas de intercambios del usuario
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de intercambios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending:
 *                   type: integer
 *                 accepted:
 *                   type: integer
 *                 rejected:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 sent:
 *                   type: integer
 *                 received:
 *                   type: integer
 */
router.get('/stats', 
  auth, 
  logExchangeAction('get stats'),
  getExchangeStats
);

/**
 * @swagger
 * /exchanges/accept/{id}:
 *   put:
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
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 *       400:
 *         description: El intercambio ya no está pendiente
 */
router.put('/accept/:id', 
  auth, 
  validateExchangeAccess,
  logExchangeAction('accept'),
  acceptExchangeRequest
);

/**
 * @swagger
 * /exchanges/reject/{id}:
 *   put:
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón del rechazo (opcional)
 *     responses:
 *       200:
 *         description: Intercambio rechazado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 *       400:
 *         description: El intercambio ya no está pendiente
 */
router.put('/reject/:id', 
  auth, 
  validateExchangeAccess,
  logExchangeAction('reject'),
  rejectExchangeRequest
);

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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notas adicionales (opcional)
 *               duration:
 *                 type: string
 *                 enum: ['1 semana', '2 semanas', '1 mes', '2 meses', '3+ meses', 'Flexible']
 *                 description: Duración real del intercambio (opcional)
 *     responses:
 *       200:
 *         description: Intercambio completado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 *       400:
 *         description: El intercambio no está aceptado
 */
router.put('/complete/:id', 
  auth, 
  validateExchangeAccess,
  logExchangeAction('complete'),
  completeExchange
);

/**
 * @swagger
 * /exchanges/cancel/{id}:
 *   delete:
 *     summary: Cancelar una solicitud pendiente (solo emisor)
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
 *         description: Solicitud cancelada exitosamente
 *       401:
 *         description: No autorizado (solo el emisor puede cancelar)
 *       404:
 *         description: Intercambio no encontrado
 *       400:
 *         description: Solo se pueden cancelar solicitudes pendientes
 */
router.delete('/cancel/:id', 
  auth, 
  validateExchangeAccess,
  logExchangeAction('cancel'),
  cancelExchange
);

/**
 * @swagger
 * /exchanges/{id}:
 *   get:
 *     summary: Obtener un intercambio específico por ID
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
 *         description: Información del intercambio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 sender:
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
 *                 recipient:
 *                   type: object
 *                 skills_to_offer:
 *                   type: array
 *                   items:
 *                     type: string
 *                 skills_to_learn:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, accepted, rejected, completed]
 *                 date:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Intercambio no encontrado
 */
router.get('/:id', 
  auth, 
  validateExchangeAccess,
  logExchangeAction('get by id'),
  getExchangeById
);

// ✅ AGREGADO: Middleware de manejo de errores específico para intercambios
router.use((err, req, res, next) => {
  console.error('Exchange route error:', err);
  
  // Error de validación de ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ 
      msg: 'ID de intercambio inválido',
      providedId: err.value 
    });
  }
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      msg: 'Errores de validación en intercambio', 
      errors 
    });
  }
  
  // Error de duplicación (índice único)
  if (err.code === 11000) {
    return res.status(400).json({ 
      msg: 'Ya existe una solicitud similar',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // Pasar otros errores al handler global
  next(err);
});

module.exports = router;
