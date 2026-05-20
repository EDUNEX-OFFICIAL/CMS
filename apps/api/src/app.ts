import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { healthRouter } from "./modules/health/routes/health.routes";
import { contentTypeRouter } from "./modules/cms/routes/content-type.routes";
import { entryRouter } from "./modules/cms/routes/entry.routes";
import { assetRouter } from "./modules/media/routes/asset.routes";
import { mediaFolderRouter } from "./modules/media/routes/folder.routes";
import { inviteRouter } from "./modules/invites/routes/invite.routes";
import { workspaceRouter } from "./modules/workspaces/routes/workspace.routes";
import { authenticateMiddleware } from "./middleware/authenticate";
import { errorHandlerMiddleware, notFoundHandler } from "./middleware/error-handler";
import { requestIdMiddleware } from "./middleware/request-id";
import { requestLoggerMiddleware } from "./middleware/request-logger";
import {
  corsMiddleware,
  globalRateLimiter,
  helmetMiddleware,
  hppMiddleware,
} from "./middleware/security";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(globalRateLimiter);
  app.use(hppMiddleware);
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(authenticateMiddleware);

  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/workspaces", workspaceRouter);
  app.use("/api/v1/content-types", contentTypeRouter);
  app.use("/api/v1/entries", entryRouter);
  app.use("/api/v1/assets", assetRouter);
  app.use("/api/v1/media-folders", mediaFolderRouter);
  app.use("/api/v1/invites", inviteRouter);

  app.use(notFoundHandler);
  app.use(errorHandlerMiddleware);

  return app;
}
