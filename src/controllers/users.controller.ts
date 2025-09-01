import { Request, Response } from "express";
import {
  findAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";
import { User } from "../models/User";
import { findByDynamicId } from "../services/find.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";

export async function getUsersController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc } = req.body;

      const usersList = await findAllUsers(order, asc);
      console.log("User fetched successfully");
      console.log("usersList", usersList);
      res.status(200).json({
        message: "User fetched successfully",
        usersList,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  });
}

export async function getUsersByIdController(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({
        status: 400,
        error: "User ID is required as a route parameter (e.g., /users/:id)",
      });
      return;
    }

    const user = await findByDynamicId(User, { id: userId }, false);
    if (!user) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log("User found:", user);
    res.status(200).json({ user: user, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Error fetching users:", error });
  }
}

export async function createUserController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const reqBodyValidation = validateRequiredBody(req, res, [
        "name",
        "email",
        "password",
        "phoneNumber",
      ]);
      if (!reqBodyValidation) return;

      const newUser = await createUser(req.body);
      const { password, ...userWithoutPassword } = newUser.toJSON();

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating users:", error });
    }
  });
}

export async function updateUserController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const updatedUser = await updateUser(req.body);

    if (!updatedUser) {
      console.log("No valid fields to update or user not found");
      res
        .status(400)
        .json({ error: "No valid fields to update or user not found" });
      return;
    }

    console.log("User updated successfully", updatedUser);
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating users:", error });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  try {
    const { email, id, phoneNumber } = req.body;

    if (!email && !id && !phoneNumber) {
      console.log("No identifier provided");
      res.status(400).json({ error: "Provide email, id, or phoneNumber" });
      return;
    }

    const deletedCount = await deleteUser({ email, id, phoneNumber });

    if (deletedCount === 0) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log("User deleted:", { email, id, phoneNumber });
    res.status(200).json({
      message: "User deleted successfully",
      deleted: { email, id, phoneNumber },
    });
    return;
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
}
