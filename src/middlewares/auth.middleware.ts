import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      isAdmin: boolean;
      isAgent: boolean;
    };
  }
}

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication token required" });
      return;
    }

    // Verify token
    const payload = jwt.verify(token, SECRET) as {
      id: string;
      email: string;
      isAdmin: boolean;
      isAgent: boolean;
    };

    // Optional: Verify user still exists
    const user = await User.findByPk(payload.id);
    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
