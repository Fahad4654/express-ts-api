import { Request, Response } from "express";
import {
  findAllContents,
  findContentById,
  createContent,
  updateContentById,
  deleteContentById,
} from "../services/content.service";

export async function getContents(req: Request, res: Response) {
  try {
    const order = req.body.order || "id";
    const asc = req.body.asc || "ASC";

    const contentsList = await findAllContents(order, asc);
    res.status(201).json({
      message: "Contents fetched successfully",
      contents: contentsList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getContentsById(req: Request, res: Response) {
  try {
    const contentsId = req.params.id;
    if (!contentsId) {
      res.status(400).json({ error: "Content ID is required" });
      return;
    }

    const foundContent = await findContentById(contentsId);
    if (!foundContent) {
      res.status(404).json({ error: "Content not found" });
      return;
    }

    res.status(200).json({ status: 200, data: foundContent });
  } catch (error) {
    console.error("Error finding content:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function createContentController(req: Request, res: Response) {
  try {
    const newContent = await createContent(req.body);
    res.status(201).json({
      message: "Content created successfully",
      content: newContent,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function updateContentsController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "Content id is required" });
      return;
    }

    const updatedContent = await updateContentById(req.body.id, req.body);

    res.status(200).json({
      message: "Content updated successfully",
      profile: updatedContent,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : error,
    });
  }
}

export const deleteContentsController = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    await deleteContentById(req.body.id);

    res.status(200).json({
      message: "Content deleted",
      id: req.body.id,
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
};
export { createContent };
