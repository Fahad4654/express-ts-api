import express from "express";
import { getProfit } from "../controllers/profit.controller";

const router = express.Router();

router.get("/", getProfit);

export { router as userProfitRouter };
export { router };