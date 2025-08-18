import { Router } from "express";
import {
  createContentController,
  deleteContentsController,
  getContents,
  updateContentsController,
} from "../controllers/contents.controller";

const router = Router();

router.get("/", getContents);
router.post("/", createContentController);
router.put("/", updateContentsController);
router.delete("/", deleteContentsController);

export { router as contentCreateRouter };
export { router };
