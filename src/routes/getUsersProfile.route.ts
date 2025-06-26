import { Router } from "express";
import { getUsersProfile } from "../controllers/userProfile.controller";

const router = Router();

router.get("/", getUsersProfile);

export { router as userProfileListRouter };
export { router };
