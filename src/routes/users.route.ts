import { Router } from "express";
import {
  getUsers,
  createUserController,
  updateUserController,
  deleteUserController,
  getUsersById,
} from "../controllers/users.controller";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUsersById);
router.post("/", createUserController);
router.put("/", updateUserController);
router.delete("/", deleteUserController);

export { router as userCreateRouter };
export { router };
