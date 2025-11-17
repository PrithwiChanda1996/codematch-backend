const userService = require("../services/user.service");
const { cookieConfig } = require("../config/config");
const {
  verifyRefreshToken,
  generateAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require("../services/token.service");

// Signup controller
const signup = async (req, res, next) => {
  try {
    // Call service layer to handle business logic (pass req for metadata)
    const result = await userService.registerUser(req.body, req);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, cookieConfig);

    // Send success response with only access token
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.id,
        username: result.username,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID controller
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by email controller
const getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by mobile number controller
const getUserByMobileNumber = async (req, res, next) => {
  try {
    const { mobileNumber } = req.params;
    const user = await userService.getUserByMobileNumber(mobileNumber);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Login controller
const login = async (req, res, next) => {
  try {
    // Call service layer to handle authentication (pass req for metadata)
    const result = await userService.loginUser(req.body, req);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, cookieConfig);

    // Send success response with only access token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: result.id,
        username: result.username,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update profile controller
const updateProfile = async (req, res, next) => {
  try {
    // User ID is set by authorization middleware
    const userId = req.userId;

    // Call service layer to update profile
    const updatedUser = await userService.updateUserProfile(userId, req.body);

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token controller
const refreshAccessToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const error = new Error("Refresh token not found");
      error.statusCode = 401;
      return next(error);
    }

    // Verify refresh token and get user
    const user = await verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Return new access token
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout controller (single device)
const logout = async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Clear the cookie
    res.clearCookie("refreshToken", cookieConfig);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Logout from all devices controller
const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.userId; // From authorization middleware

    // Revoke all refresh tokens for this user
    await revokeAllUserTokens(userId);

    // Clear the cookie
    res.clearCookie("refreshToken", cookieConfig);

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  getUserById,
  getUserByEmail,
  getUserByMobileNumber,
  login,
  updateProfile,
  refreshAccessToken,
  logout,
  logoutAllDevices,
};
