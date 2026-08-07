const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

router.use(authController.protect);

// ============ Workspace Members ============
router.post('/workspaces/:workspaceId/invite', memberController.inviteToWorkspace);
router.patch('/workspaces/:workspaceId/invite/accept', memberController.acceptWorkspaceInvite);
router.patch('/workspaces/:workspaceId/invite/reject', memberController.rejectWorkspaceInvite);
router.get('/workspaces/:workspaceId/members', memberController.getWorkspaceMembers);
router.delete('/workspaces/:workspaceId/members/:userId', memberController.removeWorkspaceMember);
router.patch('/workspaces/:workspaceId/members/:userId/role', memberController.changeWorkspaceRole);

// ============ Project Members ============
router.post('/projects/:projectId/invite', memberController.inviteToProject);
router.patch('/projects/:projectId/invite/accept', memberController.acceptProjectInvite);
router.patch('/projects/:projectId/invite/reject', memberController.rejectProjectInvite);
router.get('/projects/:projectId/members', memberController.getProjectMembers);
router.delete('/projects/:projectId/members/:userId', memberController.removeProjectMember);
router.patch('/projects/:projectId/members/:userId/role', memberController.changeProjectRole);

module.exports = router;