import { databaseService } from './services/database.service';
import { PORT } from './config';
import createApp from './app';

const startServer = async () => {
  // Initialize database
  await databaseService.initialize();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();