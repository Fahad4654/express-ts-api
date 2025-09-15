import express from "express";
import { getProfit, updateUserProfitController } from "../controllers/profit.controller";

const router = express.Router();

router.get("/", getProfit);
router.post("/", updateUserProfitController );
export { router as userProfitRouter };
export { router };