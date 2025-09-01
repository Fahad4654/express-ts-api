import { Request, Response } from "express";
import { Model } from "sequelize-typescript";
import { findByDynamicId } from "../services/find.service";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { GameHistory } from "../models/GameHistory";
import { Profile } from "../models/Profile";

// Allowed identifiers per model
const allowedKeys: Record<string, string[]> = {
  Account: ["id", "userId", "accountNumber"],
  Balance: ["id", "accountId"],
  BalanceTransaction: ["id", "userId", "balanceId", "accountId", "trxId"],
  GameHistory: ["id", "userId", "balanceId", "accountId", "gameId"],
  Profile: ["id", "userId", "referralCode", "referredCode"],
  User: ["id", "name", "email", "phoneNumber"],
  Game: ["id", "name"], // public-ish
  Contents: ["id", "userId", "name"], // public-ish
};

// keys that should always return ONE record
const singleResultKeys = ["id", "accountNumber", "email", "phoneNumber", "trxId"];

export function findController<T extends Model>(
  model: { new (): T } & typeof Model
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const identifiers = { ...req.body };
      const keys = Object.keys(identifiers);

      // 🔹 Must provide exactly one identifier
      if (keys.length !== 1) {
        res.status(400).json({ error: "Exactly one identifier must be provided" });
        return;
      }

      const key = keys[0];

      // 🔹 Validate allowed key
      if (!allowedKeys[model.name]?.includes(key)) {
        res.status(400).json({ error: `Invalid identifier '${key}' for ${model.name}` });
        return;
      }

      // 🔹 Ensure current user exists
      const typedUser = await findByDynamicId(User, { id: req.user?.id }, false);
      const user = typedUser as User | null;
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // 🔹 Fetch records
      const records = singleResultKeys.includes(key)
        ? await model.findOne({ where: { [key]: identifiers[key] } })
        : await model.findAll({ where: { [key]: identifiers[key] } });

      if (!records || (Array.isArray(records) && records.length === 0)) {
        res.status(404).json({ message: "No records found" });
        return;
      }

      // Normalize to array
      const resultArray = Array.isArray(records) ? records : [records];

      // 🔹 Ownership checks (skip for admins)
      if (!user.isAdmin) {
        for (const record of resultArray) {
          const ownershipCheck: Record<string, () => Promise<boolean>> = {
            Account: async () => (record as Account).userId === user.id,
            Balance: async () => {
              const balance = record as Balance;
              if (!balance.accountId) return false;
              const account = await Account.findOne({ where: { id: balance.accountId } });
              return !!account && account.userId === user.id;
            },
            BalanceTransaction: async () => (record as BalanceTransaction).userId === user.id,
            GameHistory: async () => (record as GameHistory).userId === user.id,
            Profile: async () => (record as Profile).userId === user.id,
            User: async () => (record as User).id === user.id,
            Game: async () => true,
            Contents: async () => true,
          };

          const checkFn = ownershipCheck[model.name];
          if (checkFn && !(await checkFn())) {
            res.status(403).json({ error: "Forbidden: cannot access others' data" });
            return;
          }
        }
      }

      res.status(200).json({
        [model.name.toLowerCase()]: Array.isArray(records) ? records : records,
      });
    } catch (error) {
      console.error(`Error fetching ${model.name}:`, error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  };
}
