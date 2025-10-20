import { exceptionHandlerMiddleware } from "@/middlewares/exception-handler";
import { router } from "@/routes/_router";

import { Logger } from "@/lib/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";

import {
  clearCache,
  connectRedisStorage,
  disconnectRedisStorage,
} from "@/redis/storage";
import { initCloudinary } from "./cloudinary";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(router);

app.use(exceptionHandlerMiddleware);

process.setMaxListeners(0);

const PORT = process.env.PORT || 3000;

export const expressServer = createServer(app);

import { intializeSocketIO } from "./socket/io";
import "./socket/server";

(async () => {
  await connectRedisStorage();

  await clearCache();

  initCloudinary();
  intializeSocketIO(expressServer);

  expressServer.listen(PORT, () => {
    Logger.log(
      "SERVER HEALTH",
      `HTTP server listening on http://localhost:${PORT}`
    );
  });
})();

const gracefulShutdown = async () => {
  disconnectRedisStorage();
  expressServer.close(() => {
    Logger.log("SERVER HEALTH", "HTTP server closed gracefully.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
