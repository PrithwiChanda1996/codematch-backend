export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb+srv://prithwichanda1996_db_user:ItPNoQoYxPaTD2IE@cluster0.2qbugcq.mongodb.net/devTinder',
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'devTinder_access_secret_2024',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'devTinder_refresh_secret_2024',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

