import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/redis/events/consumer";
import { getFromCache, saveToCache } from "@/redis/storage";
import { io } from "@/socket/server";
import { CustomerDineInSocket } from "./events.map";

export const customerDineInNamespace = io.of("/customer-dine-in");

customerDineInNamespace.on(
  "connection",
  async (socket: CustomerDineInSocket) => {
    console.log(`Customer connected to /customer-dine-in: ${socket.id}`);

    socket.on(
      "customer-login-opened",
      async (data: { tableId: string; message: string; timestamp: string }) => {
        try {
          const tableId = Number(data.tableId);
          console.log("Customer started order at table:", tableId);

          // Notify all waiters via redis
          // await publishEvent("customer-started-dining", tableId);
          await saveToCache(
            `diningTableStatus:${tableId}`,
            {
              tableId: tableId,
              waiterId: null,
              status: "WaitingForWaiter",
            },
            4 * 3600
          );
        } catch (err) {
          console.error(
            "Failed to send redis event(customer-started-dining): ",
            err
          );
        }
      }
    );

    socket.on("getWaiterAssignedFlag", async (tableId: number) => {
      try {
        const cachedSession = await getFromCache<{
          status: boolean;
        }>(`waiterAssignedFlag:${tableId}`);
        console.log("cache eken gaththe: ", cachedSession);
        if (!cachedSession) {
          socket.emit("waiterAssignedFlag", tableId, false);
          return;
        }
        socket.emit("waiterAssignedFlag", tableId, cachedSession.status);
      } catch (error) {
        socket.emit("waiterAssignedFlagError", tableId, error);
      }
    });

    const handleWaiterAcceptedTable = async (data: {
      tableId: number;
      waiterId: number;
    }) => {
      console.log("Customers received accepted-table event");
      socket.emit("accepted-table-customer-emit", data);
    };

    const eventBusListeners = [
      ["accepted-table", handleWaiterAcceptedTable],
    ] as const;

    for (const [event, handler] of eventBusListeners) {
      await subscribeToEvent(event, handler);
    }

    socket.on("disconnect", async () => {
      for (const [event] of eventBusListeners) {
        await unsubscribeFromEvent(event);
      }
      console.log(`Customer disconnected: ${socket.id}`);
      socket.removeAllListeners();
    });
  }
);
