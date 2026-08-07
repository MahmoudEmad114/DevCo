const express = require('express');

const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();


router.use(authController.protect);

router.post('/workspace/:workspaceId', projectController.createProject);

router.get('/', projectController.getAllProjects);

router.get('/:id', projectController.getProject);

router.patch('/:id', projectController.updateProject);

router.delete('/:id', projectController.deleteProject);

module.exports = router;