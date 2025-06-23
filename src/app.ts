import express, { Application } from 'express';
import cors from 'cors';
import { sampleRouter } from './routes/sample.route';
import { userCreateRouter } from './routes/createuser.route';
import { userDeleteRouter } from './routes/deleteuser.route';
import { userListRouter } from './routes/getUsers.route';


const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/sample', sampleRouter);
  app.use('/api/createuser', userCreateRouter)
  app.use('/api/deleteuser', userDeleteRouter)
  app.use('/api/users', userListRouter)



  // Simple health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
  });

  return app;
};

export default createApp;