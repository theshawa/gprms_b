import { prisma } from "@/prisma";
import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/redis/events/consumer";
import { publishEvent } from "@/redis/events/publisher";
import { deleteFromCache, getFromCache, saveToCache } from "@/redis/storage";
import { io } from "@/socket/server";
import { Meal } from "@prisma/client";
import { Socket } from "socket.io";
import {
  CustomerDineInEmitEventsMap,
  CustomerDineInListenEventsMap,
} from "./events.map";

export const customerDineInNamespace = io.of("/customer-dine-in");

customerDineInNamespace.on(
  "connection",
  async (
    socket: Socket<
      CustomerDineInListenEventsMap,
      CustomerDineInEmitEventsMap,
      {}
    >
  ) => {
    socket.on("init", async () => {
      try {
        const tableId = parseInt(socket.handshake.query.tableId as string);
        const time = parseInt(socket.handshake.query.time as string);

        if (!tableId || !time) {
          socket.emit("initError", "Invalid tableId or time");
          return;
        }

        // await deleteFromCache("table-session:" + tableId.toString());

        const cachedSession = await getFromCache<{ id: string }>(
          "table-session:" + tableId.toString()
        );
        if (cachedSession && cachedSession.id !== socket.id) {
          socket.emit(
            "initError",
            "This table is already occupied by another session."
          );
          return;
        }

        const diningTable = await prisma.diningTable.findUnique({
          where: { id: tableId },
          include: {
            diningArea: true,
          },
        });

        let meal: Meal; // "Brunch" | "Lunch" | "HighTea" | "Dinner"

        const currentTime = new Date(Number(time));
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        if (timeInMinutes >= 0 && timeInMinutes < 720) {
          meal = Meal.Brunch; // 00:00 to 11:29
        } else if (timeInMinutes >= 720 && timeInMinutes < 1080) {
          meal = Meal.Lunch; // 11:30 to 15:59
        } else if (timeInMinutes >= 1080 && timeInMinutes < 1320) {
          meal = Meal.HighTea; // 16:00 to 18:59
        } else {
          meal = Meal.Dinner; // 19:00 to 23:59
        }

        let menu = await prisma.menu.findFirst({
          where: {
            meal,
            isActive: true,
          },
          include: {
            menuSections: {
              include: {
                menuItems: {
                  include: {
                    dish: true,
                  },
                },
              },
            },
          },
        });

        if (!diningTable) {
          socket.emit("initError", `Dining table with ID ${tableId} not found`);
          return;
        }

        if (!menu) {
          socket.emit("initError", `No active menu found for meal ${meal}`);
          return;
        }

        if (!cachedSession) {
          await saveToCache(
            "table-session:" + tableId.toString(),
            {
              id: socket.id,
              status: "waiting-for-waiter",
              waiter: null,
              diningTable,
              menu,
            },

            60 * 60 * 2 // 2 hours
          );
        }

        socket.emit("initResponse", {
          diningTable,
          menu,
        });

        await publishEvent("order-started", tableId);
      } catch (error) {
        socket.emit(
          "initError",
          "An unknown error occurred while initializing."
        );
      }
    });

    socket.on("disconnect", async () => {
      try {
        const tableId = socket.handshake.query.tableId as string;

        const cachedSession = await getFromCache<{ id: string }>(
          "table-session:" + tableId.toString()
        );

        if (cachedSession && cachedSession.id === socket.id) {
          await publishEvent("order-ended", parseInt(tableId));
          await deleteFromCache("table-session:" + tableId.toString());
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    const handleWaiterAcceptTable = async (d: {
      waiterId: number;
      tableId: number;
    }) => {
      // const cachedSession = await getFromCache<{ id: string }>(
      //   "table-session:" + d.tableId.toString()
      // );
      // await saveToCache(
      //   "table-session:" + d.tableId.toString(),
      //   { ...cachedSession, status: "ongoing" },
      //   60 * 60 * 2 // 2 hours
      // );
      // if (cachedSession?.id === socket.id) {
      //   socket.emit("waiterAccepted", true);
      // }
    };

    const eventBusListeners = [
      ["waiter-accepted-table", handleWaiterAcceptTable],
    ] as const;

    for (const [event, handler] of eventBusListeners) {
      await subscribeToEvent(event, handler);
    }

    socket.on("disconnect", async () => {
      for (const [event] of eventBusListeners) {
        await unsubscribeFromEvent(event);
      }

      socket.removeAllListeners();
    });
  }
);
