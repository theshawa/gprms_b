import { Logger } from "@/lib/logger";
import { createClient } from "redis";

const publisher = createClient({
  url: process.env.REDIS_URL,
  name: "gprms-events-publisher",
});

export const connectRedisEventsPublisher = async () => {
  try {
    await publisher.connect();
    Logger.log(
      "REDIS EVENTS PUBLISHER",
      "Redis Events Publisher connected successfully to",
      process.env.REDIS_URL
    );
  } catch (error) {
    Logger.log("REDIS EVENTS PUBLISHER", "Redis Events Publisher connection failed:", error);
  }
};

export const publishEvent = async (event: string, payload: any) => {
  const message = JSON.stringify(payload);
  Logger.log("REDIS EVENTS PUBLISHER", `Publishing event: ${event}`, JSON.stringify(payload));
  await publisher.publish(event, message);
};

export const disconnectRedisEventsPublisher = async () => {
  await publisher.quit();
};
