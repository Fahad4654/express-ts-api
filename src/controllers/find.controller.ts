import { Request, Response } from "express";
import { Model } from "sequelize-typescript";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { GameHistory } from "../models/GameHistory";
import { Profile } from "../models/Profile";
import { Contents } from "../models/Contents";

// Allowed identifiers per model
const allowedKeys: Record<string, string[]> = {
  Account: [
    "id",
    "userId",
    "accountNumber",
    "currency",
    "accountType",
    "status",
    "createdAt",
    "updatedAt",
  ],
  Balance: [
    "id",
    "accountId",
    "availableBalance",
    "holdBalance",
    "withdrawableBalance",
    "currency",
    "lastTransactionAt",
    "createdAt",
    "updatedAt",
  ],
  BalanceTransaction: [
    "id",
    "balanceId",
    "accountId",
    "userId",
    "type",
    "direction",
    "amount",
    "currency",
    "description",
    "trxId",
    "status",
    "createdAt",
    "updatedAt",
  ],
  Contents: [
    "id",
    "userId",
    "name",
    "text",
    "type",
    "mediaUrl",
    "status",
    "exclusive",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
  ],
  GameHistory: [
    "id",
    "balanceId",
    "accountId",
    "userId",
    "gameId",
    "type",
    "direction",
    "amount",
    "currency",
    "description",
    "createdAt",
    "updatedAt",
  ],
  Profile: [
    "id",
    "userId",
    "bio",
    "avatarUrl",
    "address",
    "referralCode",
    "referredCode",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
  ],
  User: [
    "id",
    "name",
    "email",
    "password",
    "isAdmin",
    "phoneNumber",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
  ],
  Game: [
    "id",
    "name",
    "description",
    "minimumBet",
    "maximumBet",
    "gameStatus",
    "createdAt",
    "updatedAt",
  ],
};

// Keys that always return ONE record
const singleResultKeys = [
  "id",
  "accountNumber",
  "email",
  "phoneNumber",
  "trxId",
];

export function findController<T extends Model>(
  model: { new (): T } & typeof Model
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract pagination params, ordering, and identifiers
      const rawPage = Number(req.body.page ?? 1);
      const rawPageSize = Number(req.body.pageSize ?? 10);
      const orderBy = req.body.orderBy as string | undefined;
      const sortOrder = (req.body.sortOrder as "ASC" | "DESC") || "DESC";
      const page = rawPage > 0 ? rawPage : 1;
      const pageSize = rawPageSize > 0 ? rawPageSize : 10;
      const offset = (page - 1) * pageSize;

      // Separate all special params from identifiers
      const {
        page: _,
        pageSize: __,
        orderBy: ___,
        sortOrder: ____,
        ...identifierFields
      } = req.body;

      const keys = Object.keys(identifierFields);

      // Must provide exactly one identifier
      if (keys.length !== 1) {
        res
          .status(400)
          .json({ error: "Exactly one identifier must be provided" });
        return;
      }

      const key = keys[0];

      // Validate allowed key
      if (!allowedKeys[model.name]?.includes(key)) {
        res
          .status(400)
          .json({ error: `Invalid identifier '${key}' for ${model.name}` });
        return;
      }

      // Validate orderBy field if provided
      if (orderBy && !allowedKeys[model.name]?.includes(orderBy)) {
        console.log(model);
        res.status(400).json({
          error: `Invalid order field '${orderBy}' for ${model.name}`,
        });
        return;
      }

      // Validate sortOrder
      if (sortOrder && !["ASC", "DESC"].includes(sortOrder.toUpperCase())) {
        res.status(400).json({ error: "sortOrder must be 'ASC' or 'DESC'" });
        return;
      }

      // Ensure current user exists
      const user = await User.findByPk(req.user?.id);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      let records: T[] | T | null;
      let pagination:
        | { total: number; page: number; pageSize: number; totalPages: number }
        | undefined;

      const includeModels: any[] = [];
      if (model.name === "User") {
        includeModels.push(
          {
            model: Profile,
            attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
          },
          {
            model: Account,
            attributes: {
              exclude: ["userId", "currency", "createdAt", "updatedAt"],
            },
            include: [
              {
                model: Balance,
                attributes: {
                  exclude: ["accountId", "createdAt", "updatedAt"],
                },
              },
            ],
          }
        );
      }

      // Build order clause with proper typing
      const order = orderBy ? ([[orderBy, sortOrder]] as any) : undefined;

      if (singleResultKeys.includes(key)) {
        // Single record
        const record = await model.findOne({
          where: { [key]: identifierFields[key] },
          include: includeModels,
          order,
        });
        records = record as unknown as T | null;
      } else {
        // Multiple records with pagination
        const { rows, count } = await model.findAndCountAll({
          where: { [key]: identifierFields[key] },
          limit: pageSize,
          offset,
          include: includeModels,
          order,
        });
        records = rows as T[];
        pagination = {
          total: count,
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize),
        };
      }

      if (!records || (Array.isArray(records) && records.length === 0)) {
        res.status(404).json({ message: "No records found" });
        return;
      }

      // Normalize to array for ownership check
      const resultArray = Array.isArray(records) ? records : [records];

      // Ownership checks (skip for admins)
      if (!user.isAdmin) {
        for (const record of resultArray) {
          const ownershipCheck: Record<string, () => Promise<boolean>> = {
            Account: async () =>
              (record as unknown as Account).userId === user.id,
            Balance: async () => {
              const balance = record as unknown as Balance;
              if (!balance.accountId) return false;
              const account = await Account.findByPk(balance.accountId);
              return !!account && account.userId === user.id;
            },
            BalanceTransaction: async () =>
              (record as unknown as BalanceTransaction).userId === user.id,
            GameHistory: async () =>
              (record as unknown as GameHistory).userId === user.id,
            // Profile: async () =>
            //   (record as unknown as Profile).userId === user.id,
            User: async () => (record as unknown as User).id === user.id,
            Game: async () => true,
            Contents: async () => true,
          };

          const checkFn = ownershipCheck[model.name];
          if (checkFn && !(await checkFn())) {
            res
              .status(403)
              .json({ error: "Forbidden: cannot access others' data" });
            return;
          }
        }
      }

      res.status(200).json({
        [model.name.toLowerCase()]: Array.isArray(records) ? records : records,
        ...(pagination ? { pagination } : {}),
      });
    } catch (error) {
      console.error(`Error fetching ${model.name}:`, error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}
