const ONE_HOUR_MS = 60 * 60 * 1000;

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL,
  passwordResetPath: process.env.PASSWORD_RESET_PATH || 'reset-password',
  passwordResetTokenTtlMs: parseInt(process.env.PASSWORD_RESET_TOKEN_TTL_MS ?? '', 10) || ONE_HOUR_MS,
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL,
  },
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  },
});
