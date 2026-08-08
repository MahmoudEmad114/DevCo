const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { uploadUserPhoto } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Protect all user routes
router.use(authController.protect);

// Current user
router.get("/me", userController.getMe);

router.patch(
    "/updateMe",
    uploadUserPhoto,
    userController.updateMe
);

router.delete("/deleteMe", userController.deleteMe);

// Upload photo
router.patch(
    "/uploadPhoto",
    uploadUserPhoto,
    userController.uploadPhoto
);

// Search users
router.get("/search", userController.searchUsers);

// All users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUser);

module.exports = router;