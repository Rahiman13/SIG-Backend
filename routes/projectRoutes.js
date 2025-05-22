const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth, isAdmin } = require('../middleware/auth');

// CRUD Routes
router.post('/', auth, isAdmin, projectController.createProject);
router.get('/', auth, projectController.getAllProjects);
router.get('/:id', auth, projectController.getProjectById);
router.put('/:id', auth, isAdmin, projectController.updateProject);
router.delete('/:id', auth, isAdmin, projectController.deleteProject);

module.exports = router;
