const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');


const router = express.Router();

router
    .post('/signup', authController.signup)
    .post('/login', authController.login);

router.get('/logout', authController.logout);


router.use(authController.protect)

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// router.use(authController.restrictTo('admin'))

router
    .route('/')
    .get(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)


module.exports = router;