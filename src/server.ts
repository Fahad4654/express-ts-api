import { databaseService } from "./services/database.service";
import { PORT, CREATE_ADMIN } from "./config";
import createApp from "./app";
import { createAdmin } from "./services/createAdmin.service";

const startServer = async () => {
  // Initialize database
  await databaseService.initialize();
  if (CREATE_ADMIN==true) {
    createAdmin();
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
