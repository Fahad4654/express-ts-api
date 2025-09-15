import { Request, Response } from "express";
import { Profit } from "../models/Profit";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { updateProfit } from "../services/profit.refresh";

export async function getProfit(req: Request, res: Response) {
  const adminMiddleware = isAdmin();
  adminMiddleware(req, res, async () => {
    try {
      const profit = await Profit.findOne();

      if (!profit) {
        res
          .status(404)
          .json({ success: false, message: "No profit data found" });
        return;
      }

      res.status(200).json({ success: true, data: profit });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
      return;
    }
  });
}

export async function updateUserProfitController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();
  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body required");
        res.status(400).json({ error: "Request body required" });
        return;
      }

      const updatedProfit = await updateProfit(req.body);

      if (!updatedProfit) {
        console.log("No valid fields provided for update or profile not found");
        res.status(400).json({
          error: "No valid fields provided for update or profile not found",
        });
        return;
      }

      console.log("Profile updated successfully", updatedProfit);
      res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfit,
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
  });
}
