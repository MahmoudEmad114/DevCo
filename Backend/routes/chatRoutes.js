const express = require('express');

const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
    '/:projectId/messages',
    chatController.getMessages
);

router.post(
    '/:projectId/messages',
    chatController.sendMessage
);

router.delete(
    '/messages/:id',
    chatController.deleteMessage
);

module.exports = router;