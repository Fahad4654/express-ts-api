import { Request, Response } from "express";
import { Model } from "sequelize-typescript";
import { findByDynamicId } from "../services/find.service";

/**
 * Generic find controller.
 * Only allows exactly one identifier key at a time.
 */
export function findController<T extends Model>(
  model: { new (): T } & typeof Model
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      console.log(req.body);
      const identifiers = req.body;

      if (!identifiers || Object.keys(identifiers).length === 0) {
        res.status(400).json({ error: "At least one identifier is required" });
        return;
      }

      const result = await findByDynamicId(model, identifiers, true);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        res.status(404).json({ message: "No records found" });
        return;
      }

      res.status(200).json({ data: result });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  };
}
