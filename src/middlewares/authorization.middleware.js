/**
 * Authorization middleware
 * Handles permission checks and access control
 *
 * Note: This middleware must be used AFTER authentication middleware
 * as it relies on req.user being populated
 */

/**
 * Middleware to authorize user to access their own profile
 * Extracts user ID from JWT token and attaches to req.params or req.body
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeOwnProfile = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user || !req.user.id) {
      const error = new Error("Authorization failed. User not authenticated");
      error.statusCode = 401;
      return next(error);
    }

    // Attach authenticated user's ID to request for downstream use
    req.userId = req.user.id;

    // Proceed to next middleware
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access a specific user resource
 * Allows user to access their own resources
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeUserAccess = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      const error = new Error("Authorization failed. User not authenticated");
      error.statusCode = 401;
      return next(error);
    }

    // Get target user ID from route params
    const targetUserId = req.params.id;

    // Check if user is accessing their own resource
    if (req.user.id !== targetUserId) {
      // For now, allow access to any user's profile (read-only)
      // In future, you can restrict this or implement role-based access
      // const error = new Error("Access denied. You can only access your own profile");
      // error.statusCode = 403;
      // return next(error);
    }

    // Attach user ID for downstream use
    req.userId = req.user.id;

    // Proceed to next middleware
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory to check if user has required role
 * Can be extended to support role-based access control (RBAC)
 *
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        const error = new Error("Authorization failed. User not authenticated");
        error.statusCode = 401;
        return next(error);
      }

      // Check if user has required role (when roles are implemented)
      // For now, this is a placeholder for future enhancement
      const userRole = req.user.role || "user"; // Default role is 'user'

      if (!allowedRoles.includes(userRole)) {
        const error = new Error("Access denied. Insufficient permissions");
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns a resource
 * Generic middleware that can be used for any resource ownership check
 *
 * @param {Function} getResourceOwnerId - Function to get owner ID from request
 * @returns {Function} - Express middleware function
 */
const authorizeResourceOwner = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        const error = new Error("Authorization failed. User not authenticated");
        error.statusCode = 401;
        return next(error);
      }

      // Get resource owner ID using provided function
      const ownerId = await getResourceOwnerId(req);

      // Check if user owns the resource
      if (req.user.id !== ownerId) {
        const error = new Error(
          "Access denied. You don't have permission to access this resource"
        );
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeOwnProfile,
  authorizeUserAccess,
  authorizeRoles,
  authorizeResourceOwner,
};
