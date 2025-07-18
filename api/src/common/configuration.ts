export const configuration = () => {
  return {
    env: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    port: process.env.PORT || 3002,
    database: {
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT as unknown as number,
      name: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      url: process.env.DATABASE_URL,
    },
    jwtConstants: {
      secretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
      secretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
      accessTokenExpiresIn: Number(
        process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      ),
      refreshTokenExpiresIn: Number(
        process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      ),
      issuer: process.env.JWT_ISSUER,
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT as unknown as number,
      secure: process.env.EMAIL_SECURE,
      username: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
  };
};
