import { Router } from "express";
import { createContent, deleteContents, getContents, getContentsById, updateContents } from "../controllers/contents.controller";

const router = Router();

router.get("/", getContents);
router.get("/:id", getContentsById);
router.post("/", createContent);
router.put("/", updateContents);
router.delete("/", deleteContents)

export { router as contentCreateRouter };
export { router };
