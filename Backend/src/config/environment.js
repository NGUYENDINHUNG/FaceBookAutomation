import dotenv from "dotenv";
dotenv.config();

export const environment = {
  // Server
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 8000,

  // Database
  DATABASE: process.env.DATABASE,

  // Facebook App
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL?.replace(
    /\/+/g,
    "/"
  ),
  FACEBOOK_API_URL: process.env.FACEBOOK_API_URL,
  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET_NAME: process.env.AWS_S3_BUCKET,

  //JWTJWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE,

  //CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
