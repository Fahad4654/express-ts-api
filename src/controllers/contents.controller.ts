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
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      console.log("Field to sort is required");
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      console.log("Order direction is required");
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const contentsList = await findAllContents(order, asc);
    console.log("Contents fetched successfully", contentsList);
    res.status(201).json({
      message: "Contents fetched successfully",
      contents: contentsList,
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
}

export async function getContentsById(req: Request, res: Response) {
  try {
    const contentsId = req.params.id;
    if (!contentsId) {
      console.log("Content ID is required");
      res.status(400).json({ error: "Content ID is required" });
      return;
    }

    const foundContent = await findContentById(contentsId);
    if (!foundContent) {
      console.log("Content not found");
      res.status(404).json({ error: "Content not found" });
      return;
    }

    console.log("Content found", foundContent);
    res.status(200).json({ status: 200, content: foundContent });
    return;
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
}

export async function updateContentsController(req: Request, res: Response) {
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
}

export const deleteContentsController = async (req: Request, res: Response) => {
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
};
export { createContent };
