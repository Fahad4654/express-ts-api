import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import { Profile } from "../models/Profile";
import { Token } from "../models/Token";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../config";
import { Contents } from "../models/Contents";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { Game } from "../models/Game";
import { GameHistory } from "../models/GameHistory";
import { Profit } from "../models/Profit";
import { ProfitSnapshot } from "../models/ProfitSnapshot";

const sequelize = new Sequelize({
  database: DB_NAME,
  dialect: "postgres",
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  models: [User, Profile, Token, Contents, Account, Balance, BalanceTransaction, Game, GameHistory, Profit, ProfitSnapshot], // Add all models here
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
