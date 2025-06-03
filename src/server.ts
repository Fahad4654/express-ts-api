import createApp from './app';
import { PORT } from './config';

const startServer = () => {
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();