import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Requires valid refresh token
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export { router as authRouter };
export { router };
