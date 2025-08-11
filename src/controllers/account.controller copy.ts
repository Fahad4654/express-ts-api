import { Account } from "../models/Account";
import { Request, RequestHandler, Response } from "express";
import { User } from "../models/User";

//User Account
export const getAccounts: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const userAccounts = await Account.findAll({
      include: [
        {
          model: User,
          // Optionally exclude account fields if needed
          attributes: ["id", "name", "email"],
        },
      ],
      nest: true, // Preserves nested structure
      raw: true, // Returns plain objects
      order: [
        [
          `${req.body.order ? req.body.order : "id"}`,
          `${req.body.asc ? req.body.asc : "ASC"}`,
        ],
      ], //{'property':'ASC/DESC'}}
    });
    console.log("User's Accounts list:", userAccounts);
    res.status(201).json({
      message: "User's Accounts fetching successfully",
      userAccounts: userAccounts,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user's accounts:", error);
    res.status(500).json(error);
  }
};

//get User Account by ID
export async function getAccountById(req: Request, res: Response) {
  try {
    const userId = req.params.userId; // Change to req.query.id if using query params

    if (!userId) {
      res.status(400).json({
        status: 400,
        error: "User ID is required as a route parameter (e.g., /account/:id)",
      });
      return;
    }

    const foundUserAccount = await Account.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phoneNumber"],
        },
      ],
      nest: true, // Preserves nested structure
      raw: true, // Returns plain objects
    });

    if (!foundUserAccount) {
      res.status(404).json({
        status: 404,
        message: "User's Account not found",
      });
      return;
    }

    console.log("User's Account found:", foundUserAccount);
    res.status(200).json({
      status: 200,
      data: foundUserAccount,
    });
    return;
  } catch (error) {
    console.error("Error finding user's account:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}

export function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-8); // last 8 digits of ms time
  const random = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `AC-${timestamp}${random}`;
}

//Create User Account
export async function createAccount(req: Request, res: Response) {
  console.log(req.body);
  const { userId, currency } = req.body;
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const newUserAccount = await Account.create({
      userId,
      currency,
      accountNumber: generateAccountNumber(),
    });

    res.status(201).json({
      message: "User's Account created successfully",
      user: newUserAccount,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating user's account:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Delete User Account
export const deleteAccount: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    if (!req.body.userId) {
      res.status(400).json({ error: "UserId is required" });
      console.log(req.body.userId);
      return;
    }

    const foundUser = await User.findOne({
      where: { id: req.body.userId },
      attributes: ["id", "name", "email"],
    });

    const deletedCount = await Account.destroy({
      where: { userId: req.body.userId },
    });

    if (deletedCount === 0) {
      res.status(404).json({
        error: "User's Account not found",
        message: `User: ${foundUser?.name} doesn't have a Account`,
      });
      console.log("User's Account not found: ", foundUser?.email);
      return;
    }

    console.log("User's Account found: ", foundUser?.email);
    res.status(200).json({
      message: `User: ${foundUser?.name}'s Account is being Deleted`,
      email: foundUser?.email,
    });
  } catch (error) {
    console.error("Error deleting user's account:", error);
    res.status(500).json({ status: 500, message: error });
  }
};

//update User Account
export async function updateAccount(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      console.log("request body is required");
      return;
    }
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "UserId is required" });
      console.log("UserId is required");
      return;
    }

    // Find the account associated with the user
    const account = await Account.findOne({ where: { userId } });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      console.log("Account not found");
      return;
    }

    // Define allowed fields that can be updated with type safety
    const allowedFields: Array<keyof Account> = [
      "status",
      "currency",
      "accountType",
    ];
    const updates: Partial<Account> = {};

    // Filter and only take allowed fields from req.body with type checking
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If no valid updates were provided
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields provided for update" });
      console.log("No valid fields provided for update");
      return;
    }

    // Perform the update
    await account.update(updates);

    // Get the updated account (excluding sensitive fields if needed)
    const updatedAccount = await Account.findByPk(account.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    console.log("Account updated successfully, account: ", updatedAccount);
    res.status(200).json({
      message: "Account updated successfully",
      account: updatedAccount,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update account",
      error: error instanceof Error ? error.message : error,
    });
  }
}
