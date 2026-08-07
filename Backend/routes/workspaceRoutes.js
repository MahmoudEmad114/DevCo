const express = require('express');

const workspaceController = require('../controllers/workspaceController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/', workspaceController.createWorkspace);

router.get('/', workspaceController.getAllWorkspaces);

router.get('/:id', workspaceController.getWorkspace);

router.patch('/:id', workspaceController.updateWorkspace);

router.delete('/:id', workspaceController.deleteWorkspace);

router.delete('/:id/leave', workspaceController.leaveWorkspace);
module.exports = router;