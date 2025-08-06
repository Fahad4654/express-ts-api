import { Request, RequestHandler, Response } from "express";
import { Contents } from "../models/Contents";

//Content List
export async function getContents(req: Request, res: Response) {
  try {
    const contentsList = await Contents.findAll({
      raw: true, // Returns plain objects
      order: [
        [
          `${req.body.order ? req.body.order : "id"}`,
          `${req.body.asc ? req.body.asc : "ASC"}`,
        ],
      ], //{'property':'ASC/DESC'}}
    });
    console.log("Contents list:", contentsList);
    res.status(201).json({
      message: "Contents fetching successfully",
      contents: contentsList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching Contents:", error);
    res.status(500).json(error);
  }
}

export async function getContentsById(req: Request, res: Response) {
  try {
    // Better: Use route parameter instead of body for GET requests
    const contentsId = req.params.id; // Change to req.query.id if using query params

    if (!contentsId) {
      res.status(400).json({
        status: 400,
        error:
          "Content ID is required as a route parameter (e.g., /contents/:id)",
      });
      return;
    }

    const foundContent = await Contents.findOne({
      where: { id: contentsId },
    });

    if (!foundContent) {
      res.status(404).json({
        status: 404,
        message: "Content not found",
      });
      return;
    }

    console.log("Content found:", foundContent);
    res.status(200).json({
      status: 200,
      data: foundContent,
    });
    return;
  } catch (error) {
    console.error("Error finding content:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}

//Create Contents
export async function createContent(req: Request, res: Response) {
  const {
    userId,
    name,
    text,
    type,
    mediaUrl,
    status,
    exclusive,
    createdBy,
    updatedBy,
  } = req.body;
  try {
    const newContent = await Contents.create({
      userId,
      name,
      text,
      type,
      mediaUrl,
      status,
      exclusive,
      createdBy,
      updatedBy,
    });

    console.log("Created Content:", newContent);
    res.status(201).json({
      message: "Content created successfully",
      content: newContent,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating content:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Update contents
export async function updateContents(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      console.log("request body is required");
      return;
    }

    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: "Content id is required" });
      console.log("Content id is required", id);
      return;
    }

    // Find the profile associated with the content
    const content = await Contents.findOne({ where: { id } });

    if (!content) {
      res.status(404).json({ error: "Profile not found" });
      console.log("Profile not found");
      return;
    }

    // Define allowed fields that can be updated with type safety
    const allowedFields: Array<keyof Contents> = [
      "userId",
      "name",
      "text",
      "type",
      "mediaUrl",
      "status",
      "exclusive",
      "createdBy",
      "updatedBy",
    ];
    const updates: Partial<Contents> = {};

    // Filter and only take allowed fields from req.body with type checking
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If no valid updates were provided
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields provided for update" });
      console.log("No valid fields provided for update");
      return;
    }

    // Perform the update
    await content.update(updates);

    // Get the updated profile (excluding sensitive fields if needed)
    const updatedContent = await Contents.findByPk(content.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    console.log("Content updated successfully, Profile: ", updatedContent);
    res.status(200).json({
      message: "Content updated successfully",
      profile: updatedContent,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : error,
    });
  }
}

//Delete contents
export const deleteContents: RequestHandler = async (req, res) => {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "id is required" });
      console.log(req.body.id);
      return;
    }

    const deletedCount = await Contents.destroy({
      where: { id: req.body.id },
    });

    if (deletedCount === 0) {
      res.status(404).json({ error: "Content not found" });
      console.log("Content not found: ", req.body.id);
      return;
    }

    console.log("Content deleted:", req.body.id);
    res.status(200).json({
      message: "Content deleted",
      email: req.body.id,
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ status: 500, message: error });
  }
};
