import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser, getUsersById  } from "../controllers/users.controller";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUsersById);
router.post("/", createUser);
router.put("/", updateUser);
router.delete("/", deleteUser)

export { router as userCreateRouter };
export { router };
