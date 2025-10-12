import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_NAME = process.env.DB_NAME || "express";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
const SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const ACCESS_TOKEN_EXPIRATION =
  process.env.ACCESS_TOKEN_EXPIRATION?.toString() || "15m";
const REFRESH_TOKEN_EXPIRATION =
  process.env.REFRESH_TOKEN_EXPIRATION?.toString() || "7d";
const CREATE_ADMIN = JSON.parse(process.env.CREATE_ADMIN || "true");
const ADMIN_NAME = process.env.ADMIN_NAME || "superadmin";
const ADMIN_MAIL = process.env.ADMIN_MAIL || "superadmin@mail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
const ADMIN_PHONENUMBER = process.env.ADMIN_PHONENUMBER || "+8801711223344";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000/login";
const COMPANY_NAME = process.env.COMPANY_NAME || "Game App"

export {
  PORT,
  NODE_ENV,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ADMIN_NAME,
  ADMIN_MAIL,
  ADMIN_PASSWORD,
  ADMIN_PHONENUMBER,
  CREATE_ADMIN,
  CLIENT_URL,
  COMPANY_NAME
};
