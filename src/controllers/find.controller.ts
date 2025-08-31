import { Request, Response } from "express";
import { Model } from "sequelize-typescript";
import { findByDynamicId } from "../services/find.service";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { error } from "console";

export function findController<T extends Model>(
  model: { new (): T } & typeof Model
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const identifiers = { ...req.body };
      const typedUser = await findByDynamicId(
        User,
        { id: req.user?.id },
        false
      );
      const user = typedUser as User | null;

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // 🔒 Non-admins can only access their own records
      if (!user.isAdmin) {
        if (model.name === "Account") {
          // Ignore provided identifiers completely, always force lookup by userId
          if (identifiers.userId !== user.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }

        if (model.name === "Balance") {
          // Find the user’s account and restrict to that accountId
          const account = await Account.findOne({ where: { userId: user.id } });
          if (!account) {
            res.status(404).json({ error: "No account found for user" });
            return;
          }
          if (identifiers.accountId !== account.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }

        if (model.name === "BalanceTransaction") {
          // Ignore provided identifiers completely, always force lookup by userId
          if (identifiers.userId !== user.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }

        if (model.name === "GameHistory") {
          // Ignore provided identifiers completely, always force lookup by userId
          if (identifiers.userId !== user.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }

        if (model.name === "Profile") {
          // Ignore provided identifiers completely, always force lookup by userId
          if (identifiers.userId !== user.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }

        if (model.name === "User") {
          // Ignore provided identifiers completely, always force lookup by userId
          if (identifiers.id !== user.id) {
            res
              .status(403)
              .json({ error: "Forbidden: can only access your own history" });
            return;
          }
        }
      }

      if (!identifiers || Object.keys(identifiers).length === 0) {
        res.status(400).json({
          error: "At least one identifier and proper identifier is required",
        });
        return;
      }

      const result = await findByDynamicId(model, identifiers, true);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        res.status(404).json({ message: "No records found" });
        return;
      }

      res.status(200).json({
        [model.name.toLowerCase()]: result,
      });
    } catch (error) {
      console.error(`Error fetching ${model.name}:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}
