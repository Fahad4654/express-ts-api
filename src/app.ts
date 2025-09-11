import express, { Application } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.route";
import { authenticate } from "./middlewares/auth.middleware";
import path from "path";
import { allRoutes } from "./routes";
import { multerErrorHandler } from "./middlewares/upload";

const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/v1/api/health", (req, res) => {
    res.status(200).json({ status: "UP" });
  });

  // Public routes
  app.use("/v1/api/auth", authRouter);
  
  
  // Protected routes
  app.use(authenticate);

  app.use("/media", express.static(path.join(process.cwd(), "media")));

  // Protected routes
  app.use(allRoutes);
  app.use(multerErrorHandler);

  return app;
};

export default createApp;
