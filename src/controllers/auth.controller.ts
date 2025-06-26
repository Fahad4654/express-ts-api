import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const EXPIRATION_SECONDS = Number(process.env.JWT_EXPIRATION_TIME) || 3600; // Default: 1 hour (3600 seconds)

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      res.status(401).json({ message: `Password didn't matched` });
      return;
    }

    // Remove expiresIn to make token never expire
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      process.env.NODE_ENV === "development"
        ? {}
        : { expiresIn: EXPIRATION_SECONDS }
    );

    res.json({
      token,
      expiresIn: "never",
      message: "Token will never expire",
    });
  } catch (error) {
    next(error);
  }
};
