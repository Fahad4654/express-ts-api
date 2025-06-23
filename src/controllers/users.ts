import { User } from "../models/User";
import { Request, Response } from 'express';


export async function getUsers(req: Request, res: Response) {
  try {
    const usersList = await (await User.findAll({attributes: { exclude: ['password'] },raw: true}))
    console.log('Users list:', usersList);
    res.status(201).json({
      message: "User fetching successfully",
      user: usersList,
      status: "success"
    });
  } catch (error) {
    console.error('Error fetching user:', error);
      res.status(500).json(error);
  }
}
