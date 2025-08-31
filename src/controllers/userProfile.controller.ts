import { Request, Response } from "express";
import {
  findAllProfiles,
  createProfile,
  deleteProfileByUserId,
  updateProfileByUserId,
} from "../services/profile.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";

// User Profile List
export async function getUsersProfileController(req: Request, res: Response) {
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

      const profiles = await findAllProfiles(order, asc);
      console.log("User Profile fetched successfully", profiles);

      res.status(200).json({
        message: "User Profile fetched successfully",
        profilelist: profiles,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile", error });
    }
  });
}

// Create User Profile
export async function createUserProfileController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "userId",
        "bio",
        "avatarUrl",
        "address",
      ]);
      if (!reqBodyValidation) return;

      const newProfile = await createProfile(req.body);

      console.log("User profile created successfully", newProfile);
      res.status(201).json({
        message: "User profile created successfully",
        profile: newProfile,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(500).json({ message: "Error creating user profile", error });
    }
  });
}

// Delete User Profile
export async function deleteUserProfileController(req: Request, res: Response) {
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
    res.status(500).json({ message: "Error deleting user:", error });
  }
}

// Update User Profile
export async function updateUserProfileController(req: Request, res: Response) {
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
