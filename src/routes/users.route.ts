import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser  } from "../controllers/users.controller";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.put("/", updateUser);
router.delete("/", deleteUser)

export { router as userCreateRouter };
export { router };
