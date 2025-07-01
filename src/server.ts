import { databaseService } from "./services/database.service";
import { PORT } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/createAdmin.service";

const startServer = async () => {
  // Initialize database
  await databaseService.initialize();
  createAdmin();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
