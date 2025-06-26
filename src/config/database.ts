import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User"; // Your models
import dotenv from "dotenv";
import { Profile } from "../models/Profile";

dotenv.config();

const DB_NAME = process.env.DB_NAME || "express";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

const sequelize = new Sequelize({
  database: DB_NAME,
  dialect: "postgres",
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  models: [User, Profile], // Add all models here
  logging: false,
  dialectOptions: {
    ssl:
      process.env.DB_SSL === "true"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export { sequelize };
