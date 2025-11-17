const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config/config");
const RefreshToken = require("../models/refreshToken.model");
const User = require("../models/user.model");

/**
 * Generate access token (short-lived)
 * @param {Object} user - User document
 * @returns {string} - JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    jwtConfig.accessTokenSecret,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} user - User document
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      type: "refresh", // Identify token type
    },
    jwtConfig.refreshTokenSecret,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );
};

/**
 * Store refresh token in database
 * @param {string} token - Refresh token
 * @param {string} userId - User ID
 * @param {Object} req - Express request object (for metadata)
 * @returns {Promise<Object>} - Stored refresh token document
 */
const storeRefreshToken = async (token, userId, req = {}) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const refreshToken = new RefreshToken({
    token,
    userId,
    expiresAt,
    userAgent: req.headers?.["user-agent"] || null,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
  });

  await refreshToken.save();
  return refreshToken;
};

/**
 * Verify and get user from refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<Object>} - User object
 */
const verifyRefreshToken = async (token) => {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret);

    // Check if token type is refresh
    if (decoded.type !== "refresh") {
      const error = new Error("Invalid token type");
      error.statusCode = 401;
      throw error;
    }

    // Check if token exists and is not revoked in database
    const storedToken = await RefreshToken.findOne({
      token,
      userId: decoded.id,
      isRevoked: false,
    });

    if (!storedToken) {
      const error = new Error("Refresh token not found or has been revoked");
      error.statusCode = 401;
      throw error;
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      const error = new Error("Refresh token has expired");
      error.statusCode = 401;
      throw error;
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Invalid refresh token";
      error.statusCode = 401;
    } else if (error.name === "TokenExpiredError") {
      error.message = "Refresh token has expired";
      error.statusCode = 401;
    }
    throw error;
  }
};

/**
 * Revoke a refresh token (logout from single device)
 * @param {string} token - Refresh token to revoke
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ userId }, { isRevoked: true });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
