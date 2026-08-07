const express = require('express');
const issueController = require('../controllers/issueController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/', issueController.getAllIssues);
router.post('/', issueController.createIssue);

router.get('/:id', issueController.getIssue);
router.patch('/:id', issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);

router.patch('/:id/assign', issueController.assignIssue);
router.patch('/:id/status', issueController.changeIssueStatus);

module.exports = router;