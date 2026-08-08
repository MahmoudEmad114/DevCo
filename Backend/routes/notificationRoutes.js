const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/', notificationController.getMyNotifications);
  router.post('/', notificationController.createNotification);  //جديد
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/mark-read', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;