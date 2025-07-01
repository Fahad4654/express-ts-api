import { Router } from "express";
import { getUsersProfile, createUserProfile, updateUserProfile, deleteUserProfile } from "../controllers/userProfile.controller";

const router = Router();

router.get("/", getUsersProfile);
router.post("/", createUserProfile);
router.put("/", updateUserProfile);
router.delete("/", deleteUserProfile)

export { router as userCreateRouter };
export { router };