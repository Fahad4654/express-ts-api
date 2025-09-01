import { Router } from "express";
import { rollDiceController } from "../controllers/games/dice.controller";

const router = Router();
router.post("/roll", rollDiceController);

export { router as diceRouter };
export { router };