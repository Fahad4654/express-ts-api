import { Router } from "express";
import { updateUser } from "../controllers/updateUsers.controller";

const router = Router();

router.post("/", updateUser);

export { router as userUpdateRouter };
export { router };
