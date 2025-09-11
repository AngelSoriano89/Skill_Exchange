const express = require('express');
const router = express.Router();
const { addSkill } = require('../controllers/skillController');
const auth = require('../middleware/auth');

// @route   POST api/skills
// @desc    Añadir una habilidad
// @access  Private
router.post('/', auth, addSkill);

module.exports = router;
