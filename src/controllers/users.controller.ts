import bcrypt from "bcryptjs";
import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { Request, RequestHandler, Response } from "express";

//User List
export async function getUsers(req: Request, res: Response) {
  try {
    const usersList = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Profile,
          // Optionally exclude profile fields if needed
          // attributes: { exclude: ['createdAt', 'updatedAt'] }
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
    console.log("Users list:", usersList);
    res.status(201).json({
      message: "User fetching successfully",
      user: usersList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json(error);
  }
}

export const generateToken = (id: string): string => {
  return id.slice(-9).toUpperCase(); // Take first N chars
};

//Create Users
export async function createUser(req: Request, res: Response) {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
      isAdmin: req.body.isAdmin,
    });
    const referralCode = `FK-${generateToken(newUser.id)}`;

    await Profile.create({
      userId: newUser.id,
      bio: "Please Edit",
      address: "Please Edit",
      referralCode: referralCode,
    });

    const { password, ...userWithoutPassword } = newUser.toJSON();
    console.log("Created user:", userWithoutPassword);
    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Update Users
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

//Delete Users
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    if (!req.body.email) {
      res.status(400).json({ error: "Email is required" });
      console.log(req.body.email);
      return;
    }

    const deletedCount = await User.destroy({
      where: { email: req.body.email },
    });

    if (deletedCount === 0) {
      res.status(404).json({ error: "User not found" });
      console.log("User not found: ", req.body.email);
      return;
    }

    console.log("User deleted:", req.body.email);
    res.status(200).json({
      message: "User deleted",
      email: req.body.email,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: 500, message: error });
  }
};
