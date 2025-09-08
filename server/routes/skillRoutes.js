// routes/skillRoutes.js

const express = require('express');
const router = express.Router();
const { 
  createSkill, 
  getSkills, 
  getMySkills, 
  getSkillById, 
  updateSkill, 
  deleteSkill, 
  getCategories, 
  getSkillsByUser 
} = require('../controllers/skillController');
const auth = require('../middleware/auth');
const { validateSkill, handleValidationErrors } = require('../middleware/validation');
const { uploadSkillImages, handleMulterError } = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Gestión de habilidades
 */

/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Crear una nueva habilidad
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - level
 *             properties:
 *               title:
 *                 type: string
 *                 example: Desarrollo Web con React
 *               description:
 *                 type: string
 *                 example: Enseño desarrollo frontend con React, hooks y context API
 *               category:
 *                 type: string
 *                 enum: ['Tecnología', 'Idiomas', 'Música', 'Arte y Diseño', 'Cocina', 'Deportes', 'Escritura', 'Fotografía', 'Manualidades', 'Negocios', 'Salud y Bienestar', 'Educación', 'Otro']
 *               level:
 *                 type: string
 *                 enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["react", "javascript", "frontend"]
 *               timeCommitment:
 *                 type: string
 *                 enum: ['1-2 horas/semana', '3-5 horas/semana', '6-10 horas/semana', 'Más de 10 horas/semana', 'Flexible']
 *               preferredFormat:
 *                 type: string
 *                 enum: ['Presencial', 'Virtual', 'Ambos']
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Habilidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', auth, uploadSkillImages, handleMulterError, validateSkill, handleValidationErrors, createSkill);

/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Obtener todas las habilidades con filtros
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filtrar por nivel
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por texto
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
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Skill'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.get('/', getSkills);

/**
 * @swagger
 * /skills/my-skills:
 *   get:
 *     summary: Obtener mis habilidades
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mis habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */
router.get('/my-skills', auth, getMySkills);

/**
 * @swagger
 * /skills/categories:
 *   get:
 *     summary: Obtener todas las categorías disponibles
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /skills/user/{userId}:
 *   get:
 *     summary: Obtener habilidades de un usuario
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Habilidades del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 */
router.get('/user/:userId', getSkillsByUser);

/**
 * @swagger
 * /skills/{id}:
 *   get:
 *     summary: Obtener una habilidad por ID
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la habilidad
 *     responses:
 *       200:
 *         description: Información de la habilidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Habilidad no encontrada
 */
router.get('/:id', getSkillById);

/**
 * @swagger
 * /skills/{id}:
 *   put:
 *     summary: Actualizar una habilidad
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la habilidad
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Habilidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Habilidad no encontrada
 */
router.put('/:id', auth, updateSkill);

/**
 * @swagger
 * /skills/{id}:
 *   delete:
 *     summary: Eliminar una habilidad
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la habilidad
 *     responses:
 *       200:
 *         description: Habilidad eliminada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Habilidad no encontrada
 */
router.delete('/:id', auth, deleteSkill);

module.exports = router;
