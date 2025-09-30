import { Request, Response } from "express";
import {
  findAllGame,
  findAllGameHistory,
  createGame,
  createGameHistory,
  deleteGameById,
  deleteGameHistoryByIdOrUserId,
  updatGameHistoryById,
  updateGameById,
  gameBalance,
  deleteAllGameHistory,
} from "../services/game.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";

// GET ALL
export const getGameController = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const reqBodyValidation = validateRequiredBody(req, res, ["order", "asc"]);
    if (!reqBodyValidation) return;

    const { order, asc, page = 1, pageSize = 10 } = req.body;

    const games = await findAllGame(order, asc, Number(page), Number(pageSize));
    console.log("Game list fetched successfully", games);
    res.status(200).json({
      message: "Game list fetched successfully",
      games,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error fetching game list:", error);
    res.status(500).json({ status: 500, message: String(error) });
  }
};

export const getGameHistoryController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;

      const { order, asc, page = 1, pageSize = 10 } = req.body;

      const gamesHistorys = await findAllGameHistory(
        order,
        asc,
        Number(page),
        Number(pageSize)
      );
      console.log("Game history list fetched successfully", gamesHistorys);
      res.status(200).json({
        message: "Game history list fetched successfully",
        gamesHistorys,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching games History list:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

// CREATE
export const createGameController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const reqBodyValidation = validateRequiredBody(req, res, [
        "name",
        "description",
        "minimumBet",
        "maximumBet",
        "status",
      ]);
      if (!reqBodyValidation) return;

      const game = await createGame(req.body);
      res.status(201).json({
        message: "Game created successfully",
        game,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

export const createGameHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, [
      "userId",
      "accountId",
      "balanceId",
      "gameId",
      "type",
      "direction",
      "amount",
      "currency",
      "description",
    ]);
    if (!reqBodyValidation) return;
    const gameHistory = await createGameHistory(req.body);
    res.status(201).json({
      message: "Game History created successfully",
      gameHistory,
      status: "success",
    });
    await gameBalance(gameHistory.id);
    return;
  } catch (error) {
    console.error("Error creating Game History:", error);
    res.status(500).json({ status: 500, message: String(error) });
  }
};

// DELETE
export const deleteGameController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const { id } = req.body;
      if (!id) {
        console.log("Id  is required");
        res.status(400).json({ error: "Id is required" });
        return;
      }

      await deleteGameById(id);
      console.log(`Game ${id} deleted successfully`);
      res.status(200).json({
        message: `Game ${id} deleted successfully`,
      });
      return;
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

export const deleteGameHistoryController = async (
  req: Request,
  res: Response
) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const { id, userId } = req.body;
      if (!id && !userId) {
        console.log("Id or userId is required");
        res.status(400).json({ error: "Id or userId is required" });
        return;
      }
      if (id && userId) {
        console.log("Provide only id OR userId");
        res.status(400).json({ error: "Provide only id OR userId" });
        return;
      }
      await deleteGameHistoryByIdOrUserId(id, userId);
      console.log(
        id
          ? `Game history ${id} deleted successfully`
          : `All ame history for user ${userId} deleted successfully`
      );
      res.status(200).json({
        message: id
          ? `Game history ${id} deleted successfully`
          : `All game history for user ${userId} deleted successfully`,
      });
      return;
    } catch (error) {
      console.error("Error deleting game history:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

// UPDATE
export const updateGameController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const { id } = req.body;
      if (!id) {
        console.log("Id is required");
        res.status(400).json({ error: "Id is required" });
        return;
      }

      const updatedGame = await updateGameById(id, req.body);
      console.log("Game updated successfully", updatedGame);
      res.status(200).json({
        message: "Game updated successfully",
        game: updatedGame,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

export const updateGameHistoryController = async (
  req: Request,
  res: Response
) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const { id } = req.body;
      if (!id) {
        console.log("Id is required");
        res.status(400).json({ error: "Id is required" });
        return;
      }

      const updatedGameHistory = await updatGameHistoryById(id, req.body);
      console.log("Game history updated successfully", updatedGameHistory);
      res.status(200).json({
        message: "Game history updated successfully",
        game: updatedGameHistory,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating game history:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};


export const deleteALLGameHistoryController = async (
  req: Request,
  res: Response
) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const result = await deleteAllGameHistory(); // ✅ renamed

      console.log(result.message);

      return res.status(200).json(result); // ✅ using Express res
    } catch (error) {
      console.error("Error deleting game history:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete Game History records",
        error: String(error),
      });
    }
  });
};