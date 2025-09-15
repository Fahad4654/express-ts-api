import { databaseService } from "./services/database.service";
import { PORT, CREATE_ADMIN } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/createAdmin.service";
import { Balance } from "./models/Balance";
import { BalanceTransaction } from "./models/BalanceTransaction";
import { GameHistory } from "./models/GameHistory";
import { refreshProfit } from "./services/profit.refresh";

const registerHooks = () => {
  // Balance hooks
  Balance.addHook("afterSave", async () => {
    setImmediate(refreshProfit);
  });
  Balance.addHook("afterDestroy", async () => {
    setImmediate(refreshProfit);
  });

  // BalanceTransaction hooks
  BalanceTransaction.addHook("afterSave", async () => {
    setImmediate(refreshProfit);
  });
  BalanceTransaction.addHook("afterDestroy", async () => {
    setImmediate(refreshProfit);
  });

  // GameHistory hooks
  GameHistory.addHook("afterSave", async () => {
    setImmediate(refreshProfit);
  });
  GameHistory.addHook("afterDestroy", async () => {
    setImmediate(refreshProfit);
  });
};

const startServer = async () => {
  try {
    // Initialize database
    await databaseService.initialize();

    // Run initial stats calculation
    await refreshProfit();

    // Register model hooks
    registerHooks();

    // Create admin if required
    if (CREATE_ADMIN) {
      await createAdmin();
    }

    // Start server
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
