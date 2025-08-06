import { Profile } from "../models/Profile";
import { Request, RequestHandler, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "./users.controller";

//User Profile
export const getUsersProfile: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }
    if (!asc) {
      res.status(400).json({ error: "asc is required" });
      return;
    }

    const usersProfileList = await Profile.findAll({
      include: [
        {
          model: User,
          // Optionally exclude profile fields if needed
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
    console.log("Users list:", usersProfileList);
    res.status(201).json({
      message: "User fetching successfully",
      userProfiles: usersProfileList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json(error);
  }
};

//get User Profile by ID
export async function getUserProfileById(req: Request, res: Response) {
  try {
    // Better: Use route parameter instead of body for GET requests
    const userId = req.params.id; // Change to req.query.id if using query params

    if (!userId) {
      res.status(400).json({
        status: 400,
        error: "User ID is required as a route parameter (e.g., /users/:id)",
      });
      return;
    }

    const foundUserProfile = await Profile.findOne({
      where: { userId: userId },
      include: [
        {
          model: User,
          // Optionally exclude profile fields if needed
          attributes: ["id", "name", "email"],
        },
      ],
      nest: true, // Preserves nested structure
      raw: true, // Returns plain objects
    });

    if (!foundUserProfile) {
      res.status(404).json({
        status: 404,
        message: "User Profile not found",
      });
      return;
    }

    console.log("User's Profile found:", foundUserProfile);
    res.status(200).json({
      status: 200,
      data: foundUserProfile,
    });
    return;
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}

//Create User Profile
export async function createUserProfile(req: Request, res: Response) {
  console.log(req.body);
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }

    const referralCode = `FK-${generateToken(req.body.userId)}`;
    const newUserProfile = await Profile.create({
      userId: req.body.userId,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
      address: req.body.address,
      referralCode: referralCode,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUserProfile,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Delete User Profile
export const deleteUserProfile: RequestHandler = async (req, res) => {
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

    const deletedCount = await Profile.destroy({
      where: { userId: req.body.userId },
    });

    if (deletedCount === 0) {
      res.status(404).json({
        error: "User's Profile not found",
        message: `User: ${foundUser?.name} doesn't have a profile`,
      });
      console.log("User's Profile not found: ", foundUser?.email);
      return;
    }

    console.log("User's Profile found: ", foundUser?.email);
    res.status(200).json({
      message: `User: ${foundUser?.name}'s profile is being Deleted`,
      email: foundUser?.email,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: 500, message: error });
  }
};

export async function updateUserProfile(req: Request, res: Response) {
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

    // Find the profile associated with the user
    const profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      console.log("Profile not found");
      return;
    }

    // Define allowed fields that can be updated with type safety
    const allowedFields: Array<keyof Profile> = ["bio", "avatarUrl", "address"];
    const updates: Partial<Profile> = {};

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
    await profile.update(updates);

    // Get the updated profile (excluding sensitive fields if needed)
    const updatedProfile = await Profile.findByPk(profile.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    console.log("Profile updated successfully, Profile: ", updatedProfile);
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
