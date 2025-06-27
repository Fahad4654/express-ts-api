import { Router } from "express";
import { updateUserProfile } from "../controllers/userProfile.controller";

const router = Router();

router.post("/", updateUserProfile);

export { router as userProfileUpdateRouter };
export { router };
