import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { Request, Response } from "express";

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
