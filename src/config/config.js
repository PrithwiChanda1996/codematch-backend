const dbConfig = {
  connectionString:
    "mongodb+srv://prithwichanda1996_db_user:ItPNoQoYxPaTD2IE@cluster0.2qbugcq.mongodb.net/devTinder",
};

const jwtConfig = {
  secret: "devTinder_secret_key_2024", // Kept for backward compatibility
  accessTokenSecret: "devTinder_access_secret_2024", // Separate secret for access tokens
  refreshTokenSecret: "devTinder_refresh_secret_2024", // Separate secret for refresh tokens
  accessTokenExpiry: "15m", // Access token expires in 15 minutes
  refreshTokenExpiry: "7d", // Refresh token expires in 7 days
  expiresIn: "7d", // Kept for backward compatibility
};

// Cookie configuration for refresh tokens
const cookieConfig = {
  httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
  // secure: process.env.NODE_ENV === "production", // Only HTTPS in production
  secure: true,
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

module.exports = { dbConfig, jwtConfig, cookieConfig };
