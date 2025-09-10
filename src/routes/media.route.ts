import { Router } from "express";
import { upload } from "../middlewares/upload";
import { MediaController } from "../controllers/media.controller";

const router = Router();

// Single file upload
router.post("/", upload.single("file"), MediaController.uploadFile);

// Multiple files upload (example: 5 max)
router.post("/", upload.array("files", 5), (req, res) => {
  res.json({
    success: true,
    files: req.files,
  });
});

export { router as pokerRouter };
export { router };
