import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export const isAdminOrAgent = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      // ✅ Check role flags
      if (!user.isAdmin && !user.isAgent) {
        return res.status(403).json({
          message: "Access denied. Admin or Agent role required.",
        });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
