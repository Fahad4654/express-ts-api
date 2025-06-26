import { RequestHandler } from 'express';
import { User } from "../models/User";

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    if (!req.body.email) {
      res.status(400).json({ error: "Email is required" });
      console.log(req.body.email)
      return;
    }

    const deletedCount = await User.destroy({
      where: { email: req.body.email }
    });

    if (deletedCount === 0) {
      res.status(404).json({ error: "User not found" });
      console.log("User not found: ",req.body.email)
      return;
    }

    console.log("User deleted:", req.body.email)
    res.status(200).json({ 
      message: "User deleted",
      email: req.body.email 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 500, message: error });;
  }
};