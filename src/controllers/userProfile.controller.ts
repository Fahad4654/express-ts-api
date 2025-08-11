import { Request, Response } from "express";
import {
  findAllProfiles,
  findProfileByUserId,
  createProfile,
  deleteProfileByUserId,
  updateProfileByUserId,
} from "../services/profile.service";

// User Profile List
export async function getUsersProfile(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("request body is required");
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      console.log("Field to sort is required");
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      console.log("Order direction is required");
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const profiles = await findAllProfiles(order, asc);
    console.log("User Profile fetched successfully", profiles);

    res.status(200).json({
      message: "User Profile fetched successfully",
      userProfiles: profiles,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json(error);
  }
}

// Get User Profile by ID
export async function getUserProfileById(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    if (!userId) {
      console.log(
        "User ID is required as a route parameter (e.g., /users/:id)"
      );
      res.status(400).json({
        error: "User ID is required as a route parameter (e.g., /users/:id)",
      });
      return;
    }

    const profile = await findProfileByUserId(userId);

    if (!profile) {
      console.log("User Profile not found");
      res.status(404).json({ message: "User Profile not found" });
      return;
    }

    console.log("User found", profile);
    res.status(200).json({
      status: "success",
      data: profile,
    });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Create User Profile
export async function createUserProfile(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("request body is required");
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const newProfile = await createProfile(req.body);

    console.log("User created successfully", newProfile);
    res.status(201).json({
      message: "User created successfully",
      user: newProfile,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

// Delete User Profile
export async function deleteUserProfile(req: Request, res: Response) {
  try {
    if (!req.body || !req.body.userId) {
      console.log("UserId is required");
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const { deletedCount, user } = await deleteProfileByUserId(req.body.userId);

    if (deletedCount === 0) {
      console.log(`User: ${user?.name} doesn't have a profile`);
      res.status(404).json({
        error: "User's Profile not found",
        message: `User: ${user?.name} doesn't have a profile`,
      });
      return;
    }

    console.log(`User: ${user?.name}'s profile is being deleted`);
    res.status(200).json({
      message: `User: ${user?.name}'s profile is being deleted`,
      email: user?.email,
    });
    return;
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

// Update User Profile
export async function updateUserProfile(req: Request, res: Response) {
  try {
    if (!req.body || !req.body.userId) {
      console.log("UserId is required");
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const updatedProfile = await updateProfileByUserId(
      req.body.userId,
      req.body
    );

    if (!updatedProfile) {
      console.log("No valid fields provided for update or profile not found");
      res.status(400).json({
        error: "No valid fields provided for update or profile not found",
      });
      return;
    }

    console.log("Profile updated successfully", updatedProfile);
    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
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
