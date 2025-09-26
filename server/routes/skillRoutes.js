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

// POST /api/skills - Crear skill
router.post('/', auth, createSkill);

// GET /api/skills - Obtener todas las skills
router.get('/', getSkills);

// GET /api/skills/categories - Obtener categorías
router.get('/categories', getCategories);

// GET /api/skills/my-skills - Obtener mis skills
router.get('/my-skills', auth, getMySkills);

// GET /api/skills/user/:userId - Skills por usuario
router.get('/user/:userId', getSkillsByUser);

// GET /api/skills/:id - Obtener skill por ID
router.get('/:id', getSkillById);

// PUT /api/skills/:id - Actualizar skill
router.put('/:id', auth, updateSkill);

// DELETE /api/skills/:id - Eliminar skill
router.delete('/:id', auth, deleteSkill);

module.exports = router;
