import { Request, Response } from "express";

const getSampleData = (req: Request, res: Response) => {
  res.json({ message: "Sample GET response" });
};

const createSampleData = (req: Request, res: Response) => {
  const { data } = req.body;
  res.status(201).json({ received: data });
};

export const sampleController = {
  getSampleData,
  createSampleData,
};
