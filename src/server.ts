import { exceptionHandlerMiddleware } from "@/middlewares/exception-handler";
import { router } from "@/routes/_router";

import { Logger } from "@/lib/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(router);

app.use(exceptionHandlerMiddleware);

process.setMaxListeners(0);

const PORT = process.env.PORT || 3000;

export const expressServer = createServer(app);

import {
  connectRedisEventsConsumer,
  disconnectRedisEventsConsumer,
} from "@/redis/events/consumer";
import {
  connectRedisEventsPublisher,
  disconnectRedisEventsPublisher,
} from "@/redis/events/publisher";
import { connectRedisStorage, disconnectRedisStorage } from "@/redis/storage";
(async () => {
  await connectRedisStorage();
  await connectRedisEventsPublisher();
  await connectRedisEventsConsumer();

  expressServer.listen(PORT, () => {
    Logger.log(
      "SERVER HEALTH",
      `HTTP server listening on http://localhost:${PORT}`
    );
  });
})();

import "./socket/server";

const gracefulShutdown = async () => {
  disconnectRedisEventsConsumer();
  disconnectRedisEventsPublisher();
  disconnectRedisStorage();
  expressServer.close(() => {
    Logger.log("SERVER HEALTH", "HTTP server closed gracefully.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
