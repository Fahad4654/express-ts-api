import { User } from "../models/User";
import { Request, Response } from 'express';

const getSampleData = (req: Request, res: Response) => {
  res.json({ message: 'user created' });
};


export const sampleController = {
  getSampleData
};


export async function createUser(req: Request, res: Response) {
  try {
    const newUser = await User.create({
      id: 1,
      name: 'John Doe',
      email: 'john23@example.com',
      password: 'securePassword123',
      address: '123 Main St, Anytown, USA'
    });
    console.log('Created user:', newUser.toJSON());
    res.status(201).json({
      message: "User created successfully",
      user: newUser.toJSON(),
      status: "success"
    });
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Call the function
