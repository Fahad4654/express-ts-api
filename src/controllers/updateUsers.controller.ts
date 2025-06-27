import { Request, Response } from "express";
import { User } from "../models/User";

export async function updateUser(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      console.log("request body is required");
      return;
    }

    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: "UserId is required" });
      console.log("UserId is required", id);
      return;
    }

    // Find the profile associated with the user
    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ error: "Profile not found" });
      console.log("Profile not found");
      return;
    }

    // Define allowed fields that can be updated with type safety
    const allowedFields: Array<keyof User> = [
      "name",
      "email",
      "password",
      "isAdmin",
      "phoneNumber",
    ];
    const updates: Partial<User> = {};

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
    await user.update(updates);

    // Get the updated profile (excluding sensitive fields if needed)
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });

    console.log("User updated successfully, Profile: ", updatedUser);
    res.status(200).json({
      message: "User updated successfully",
      profile: updatedUser,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : error,
    });
  }
}
