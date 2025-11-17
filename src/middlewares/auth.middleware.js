/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and protects routes
 */
const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config/config");

/**
 * Middleware to authenticate JWT access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error(
        "Authentication required. Please provide a valid access token"
      );
      error.statusCode = 401;
      return next(error);
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify access token using access token secret
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);

    // Attach decoded user information to request object
    req.user = decoded;

    // Proceed to next middleware
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === "TokenExpiredError") {
      error.message = "Access token has expired. Please refresh your token.";
      error.statusCode = 401;
      error.code = "TOKEN_EXPIRED"; // Special code for client to trigger refresh
    } else if (error.name === "JsonWebTokenError") {
      error.message = "Invalid access token";
      error.statusCode = 401;
    }
    next(error);
  }
};

module.exports = { authenticate };
