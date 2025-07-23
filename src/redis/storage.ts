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

export const saveToCache = async (key: string, value: any, ttl: number) => {
  try {
    await redisStorage.set(key, JSON.stringify(value), {
      EX: ttl,
    });
    Logger.log("REDIS STORAGE", `Saved ${key} to cache`);
  } catch (error) {
    Logger.log("REDIS STORAGE", `Failed to save ${key} to cache:`, error);
  }
};

export const getFromCache = async <T>(key: string) => {
  try {
    const value = await redisStorage.get(key);
    if (value) {
      Logger.log("REDIS STORAGE", `Retrieved ${key} from cache`);
      return JSON.parse(value) as T;
    }
    Logger.log("REDIS STORAGE", `${key} not found in cache`);
    return null;
  } catch (error) {
    Logger.log("REDIS STORAGE", `Failed to retrieve ${key} from cache:`, error);
    return null;
  }
};

export const deleteFromCache = async (key: string) => {
  try {
    await redisStorage.del(key);
    Logger.log("REDIS STORAGE", `Deleted ${key} from cache`);
  } catch (error) {
    Logger.log("REDIS STORAGE", `Failed to delete ${key} from cache:`, error);
  }
};

export const clearCache = async () => {
  try {
    await redisStorage.flushDb();
    Logger.log("REDIS STORAGE", "Cache cleared successfully");
  } catch (error) {
    Logger.log("REDIS STORAGE", "Failed to clear cache:", error);
  }
};
