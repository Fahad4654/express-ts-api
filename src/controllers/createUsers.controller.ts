import { randomInt } from "crypto";
import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { Request, Response } from "express";

export async function createUser(req: Request, res: Response) {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      isAdmin: req.body.isAdmin,
    });
    await Profile.create({
      userId: newUser.id,
      bio: "Please Edit",
      address: "Please Edit",
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
