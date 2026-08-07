const express = require('express');
const issueController = require('../controllers/issueController');

const router = express.Router();

router.get('/', issueController.getAllIssues);
router.post('/', issueController.createIssue);

router.get('/:id', issueController.getIssue);
router.patch('/:id', issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);

// extra routes for stuff the kanban board / assign dropdown need
router.patch('/:id/assign', issueController.assignIssue);
router.patch('/:id/status', issueController.changeIssueStatus);

module.exports = router;