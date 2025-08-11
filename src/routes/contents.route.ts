import { Router } from "express";
import {
  createContentController,
  deleteContentsController,
  getContents,
  getContentsById,
  updateContentsController,
} from "../controllers/contents.controller";

const router = Router();

router.get("/", getContents);
router.get("/:id", getContentsById);
router.post("/", createContentController);
router.put("/", updateContentsController);
router.delete("/", deleteContentsController);

export { router as contentCreateRouter };
export { router };
