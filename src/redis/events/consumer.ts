import { Logger } from "@/lib/logger";
import { createClient } from "redis";

const consumer = createClient({
  url: process.env.REDIS_URL,
  name: "gprms-events-consumer",
});

export const connectRedisEventsConsumer = async () => {
  try {
    await consumer.connect();
    Logger.log(
      "REDIS EVENTS CONSUMER",
      "Redis Events Consumer connected successfully to",
      process.env.REDIS_URL
    );
  } catch (error) {
    Logger.log(
      "REDIS EVENTS CONSUMER",
      "Redis Events Consumer connection failed:",
      error
    );
  }
};

export const subscribeToEvent = async (
  event: string,
  handler: (payload: any) => void
) => {
  console.log(`Subscribing to event: ${event}`);

  await consumer.subscribe(event, (message) => {
    try {
      const payload = JSON.parse(message);
      handler(payload);
    } catch (error) {
      console.log(error);
    }
  });
};

export const unsubscribeFromEvent = async (event: string) => {
  await consumer.unsubscribe(event);
};

export const disconnectRedisEventsConsumer = async () => {
  await consumer.quit();
};
