import { Request, Response } from "express";

export class MediaController {
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      res.status(200).json({
        success: true,
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`, // Public path
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
