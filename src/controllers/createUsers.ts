import { User } from "../models/User";
import { Request, Response } from 'express';


export async function createUser(req: Request, res: Response) {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      address: req.body.address
    });
    console.log('Created user:', newUser.toJSON());
    res.status(201).json({
      message: "User created successfully",
      user: newUser.toJSON(),
      status: "success"
    });
  } catch (error) {
    console.error('Error creating user:', error);
      res.status(500).json(error);
  }
}
