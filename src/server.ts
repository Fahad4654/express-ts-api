import { databaseService } from "./services/database.service";
import { PORT, CREATE_ADMIN } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/createAdmin.service";
import { Balance } from "./models/Balance";
import { BalanceTransaction } from "./models/BalanceTransaction";
import { GameHistory } from "./models/GameHistory";
import { refreshProfit, incrementProfit } from "./services/profit.refresh";
import { createMonthlySnapshot } from "./services/profit.snapshot";
import { Op } from "sequelize";
import cron from "node-cron";
import { deleteAllGameHistory } from "./services/game.service";

// 🔹 Register hooks
const registerHooks = () => {
  // Balance hooks
  Balance.addHook("afterSave", async (balance: Balance) => {
    const previous = Number(balance.previous("withdrawableBalance")) || 0;
    const delta = Number(balance.withdrawableBalance) - previous;
    if (delta !== 0)
      await incrementProfit({ total_withdrawable_balance: delta });
  });
  Balance.addHook("afterDestroy", async (balance: Balance) => {
    await incrementProfit({
      total_withdrawable_balance: -Number(balance.withdrawableBalance),
    });
  });

  // BalanceTransaction hooks
  BalanceTransaction.addHook("afterCreate", async (tx: BalanceTransaction) => {
    if (tx.type === "deposit" && tx.status === "completed") {
      await incrementProfit({ total_deposits: Number(tx.amount) });
    } else if (tx.type === "withdrawal" && tx.status === "completed") {
      await incrementProfit({ total_withdrawals: Number(tx.amount) });
    }
  });

  BalanceTransaction.addHook("afterUpdate", async (tx: BalanceTransaction) => {
    const prevAmount = Number(tx.previous("amount") || 0);
    const prevStatus = tx.previous("status");
    const prevType = tx.previous("type");

    // Subtract previous values
    if (prevType === "deposit" && prevStatus === "completed") {
      await incrementProfit({ total_deposits: -prevAmount });
    } else if (prevType === "withdrawal" && prevStatus === "completed") {
      await incrementProfit({ total_withdrawals: -prevAmount });
    }

    // Add new values
    if (tx.type === "deposit" && tx.status === "completed") {
      await incrementProfit({ total_deposits: Number(tx.amount) });
    } else if (tx.type === "withdrawal" && tx.status === "completed") {
      await incrementProfit({ total_withdrawals: Number(tx.amount) });
    }
  });

  BalanceTransaction.addHook("afterDestroy", async (tx: BalanceTransaction) => {
    if (tx.type === "deposit" && tx.status === "completed") {
      await incrementProfit({ total_deposits: -Number(tx.amount) });
    } else if (tx.type === "withdrawal" && tx.status === "completed") {
      await incrementProfit({ total_withdrawals: -Number(tx.amount) });
    }
  });

  // GameHistory hooks
  GameHistory.addHook("afterCreate", async (game: GameHistory) => {
    const delta =
      game.type === "loss" && game.direction === "debit"
        ? Number(game.amount)
        : game.type === "win" && game.direction === "credit"
        ? -Number(game.amount)
        : 0;
    await incrementProfit({ total_profit: delta });
  });

  GameHistory.addHook("afterUpdate", async (game: GameHistory) => {
    const prevAmount = Number(game.previous("amount") || 0);
    const prevType = game.previous("type");
    const prevDirection = game.previous("direction");

    const oldDelta =
      prevType === "loss" && prevDirection === "debit"
        ? prevAmount
        : prevType === "win" && prevDirection === "credit"
        ? -prevAmount
        : 0;

    const newDelta =
      game.type === "loss" && game.direction === "debit"
        ? Number(game.amount)
        : game.type === "win" && game.direction === "credit"
        ? -Number(game.amount)
        : 0;

    await incrementProfit({ total_profit: newDelta - oldDelta });
  });
};

// 🔹 Monthly cleanup task
const registerCronJobs = () => {
  // Run at 00:00 on the 1st day of each month
  cron.schedule("0 0 1 * *", async () => {
    console.log("📅 Running monthly snapshot + cleanup...");

    const now = new Date();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Take snapshot
    await createMonthlySnapshot(startOfPrevMonth, endOfPrevMonth);

    // 2. Delete old data (> 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // await GameHistory.destroy({
    //   where: { createdAt: { [Op.lt]: threeMonthsAgo } },
    // });
    await deleteAllGameHistory();

    // await BalanceTransaction.destroy({
    //   where: { createdAt: { [Op.lt]: threeMonthsAgo } },
    // });

    console.log("✅ Monthly snapshot + cleanup done.");
  });
};

const startServer = async () => {
  try {
    await databaseService.initialize();

    await refreshProfit();
    registerHooks();
    registerCronJobs();

    if (CREATE_ADMIN) await createAdmin();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
