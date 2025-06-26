import { Router } from "express";
import { deleteUserProfile } from "../controllers/userProfile.controller";

const router = Router();

// ✅ Correct: DELETE method with proper typing
router.delete("/", deleteUserProfile);

export { router as userProfileDeleteRouter };
export { router };
