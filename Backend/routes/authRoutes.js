const express = require('express');
const authController = require('./../controllers/authController')

const router = express.Router();

router
    .post('/signup', authController.signup)
    .post('/login', authController.login);

router
    .get('/logout', authController.logout);

router
    .post('/forgotPassword', authController.forgotPassword)
    .post('/resetPassword/:token', authController.resetPassword);

router.patch(
    '/updateMyPassword',
    authController.protect,
    authController.updatePassword);

module.exports = router;