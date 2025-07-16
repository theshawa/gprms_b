import { Logger } from "@/lib/logger";
import { createClient } from "redis";

const redisStorage = createClient({
  url: process.env.REDIS_URL,
});

redisStorage.on("error", (err) =>
  Logger.log("REDIS STORAGE", "Redis Storage error:", err)
);

export const connectRedisStorage = async () => {
  try {
    await redisStorage.connect();
    Logger.log(
      "REDIS STORAGE",
      "Redis Storage connected successfully to",
      process.env.REDIS_URL
    );
  } catch (error) {
    Logger.log("REDIS STORAGE", "Redis Storage connection failed:", error);
  }
};

export const disconnectRedisStorage = async () => {
  await redisStorage.quit();
};
