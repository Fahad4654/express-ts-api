import { Router } from "express";
import {
  createContentController,
  deleteContentsController,
  getContentsController,
  updateContentsController,
} from "../controllers/contents.controller";

const router = Router();

router.get("/", getContentsController);
router.post("/", createContentController);
router.put("/", updateContentsController);
router.delete("/", deleteContentsController);

export { router as contentCreateRouter };
export { router };
