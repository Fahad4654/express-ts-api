import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const EXPIRATION_SECONDS = Number(process.env.JWT_EXPIRATION_TIME) || 3600; // Default: 1 hour (3600 seconds)

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ where: { email } });
    console.log(user?.password)
    console
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = password === user.password;;
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: EXPIRATION_SECONDS }
    );

    res.json({
      token,
      expiresIn: EXPIRATION_SECONDS,
      expiresInHours: (EXPIRATION_SECONDS / 3600).toFixed(1)
    });
  } catch (error) {
    next(error);
  }
};