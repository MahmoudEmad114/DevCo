const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', notificationController.getMyNotifications);

// has to come before /:id/read or express will try to match "read-all" as an id
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;