const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadUserPhoto } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.use(authController.protect);

router.get("/me", userController.getMe);

router.patch(
    "/updateMe",
    uploadUserPhoto,
    userController.updateMe
);

router.delete("/deleteMe", userController.deleteMe);

router.patch(
    "/uploadPhoto",
    uploadUserPhoto,
    userController.uploadPhoto
);

router.get("/search", userController.searchUsers);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUser);

module.exports = router;