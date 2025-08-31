import { Request, Response } from "express";
import {
  findAllContents,
  createContent,
  updateContentById,
  deleteContentById,
} from "../services/content.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";

export async function getContentsController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc } = req.body;

      const contentsList = await findAllContents(order, asc);
      console.log("Contents fetched successfully", contentsList);
      res.status(201).json({
        message: "Contents fetched successfully",
        contentsList,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}

export async function createContentController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "userId",
        "name",
        "text",
        "mediaUrl",
        "status",
        "exclusive",
        "createdBy",
        "updatedBy",
      ]);
      if (!reqBodyValidation) return;

      const newContent = await createContent(req.body);
      console.log("Content created successfully", newContent);
      res.status(201).json({
        message: "Content created successfully",
        content: newContent,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}

export async function updateContentsController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body.id) {
        console.log("Content id is required");
        res.status(400).json({ error: "Content id is required" });
        return;
      }

      const updatedContent = await updateContentById(req.body.id, req.body);
      console.log("Content updated successfully", updatedContent);

      res.status(200).json({
        message: "Content updated successfully",
        content: updatedContent,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}

export const deleteContentsController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body.id) {
        console.log("Id is required");
        res.status(400).json({ error: "Id is required" });
        return;
      }

      await deleteContentById(req.body.id);

      console.log(`Content deleted with id: ${req.body.id}`);
      res.status(200).json({
        message: "Content deleted",
        id: req.body.id,
      });
      return;
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
};
export { createContent };
