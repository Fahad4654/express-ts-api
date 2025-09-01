import { Router } from "express";
import {
  getUsersProfileController,
  createUserProfileController,
  updateUserProfileController,
  deleteUserProfileController,
} from "../controllers/userProfile.controller";

const router = Router();

router.get("/", getUsersProfileController);
router.post("/", createUserProfileController);
router.put("/", updateUserProfileController);
router.delete("/", deleteUserProfileController);

export { router as userCreateRouter };
export { router };
