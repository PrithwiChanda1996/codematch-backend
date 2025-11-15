const express = require("express");
const router = express.Router();
const {
  signup,
  getUserById,
  getUserByEmail,
  getUserByMobileNumber,
  login,
  updateProfile,
} = require("../controller/user.controller");
const {
  validateSignup,
  validateGetUserById,
  validateGetUserByEmail,
  validateGetUserByMobile,
  validateLogin,
  validateUpdateProfile,
} = require("../middlewares/validation.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  authorizeOwnProfile,
} = require("../middlewares/authorization.middleware");

// POST /api/users/signup - User registration
router.post("/signup", validateSignup, signup);

// POST /api/users/login - User login
router.post("/login", validateLogin, login);

// PATCH /api/users/profile - Update user profile (protected)
router.patch(
  "/profile",
  authenticate,
  authorizeOwnProfile,
  validateUpdateProfile,
  updateProfile
);

// GET /api/users/:id - Get user by ID (protected)
router.get("/:id", authenticate, validateGetUserById, getUserById);

// GET /api/users/email/:email - Get user by email (protected)
router.get(
  "/email/:email",
  authenticate,
  validateGetUserByEmail,
  getUserByEmail
);

// GET /api/users/mobile/:mobileNumber - Get user by mobile number (protected)
router.get(
  "/mobile/:mobileNumber",
  authenticate,
  validateGetUserByMobile,
  getUserByMobileNumber
);

module.exports = router;
