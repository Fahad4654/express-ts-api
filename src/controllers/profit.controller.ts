import { Request, Response } from "express";
import { Profit } from "../models/Profit";
import { isAdmin } from "../middlewares/isAdmin.middleware";

export async function getProfit(req: Request, res: Response) {
  const adminMiddleware = isAdmin();
  try {
    const profit = await Profit.findOne();

    if (!profit) {
      res.status(404).json({ success: false, message: "No profit data found" });
      return;
    }

    res.status(200).json({ success: true, data: profit });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
}
