import { prisma } from "@/prisma";
import { saveToCache } from "@/redis/storage";
import { Socket } from "socket.io";
import { getSocketIO } from "../io";

export const registerCustomerDineInHandlers = (socket: Socket) => {
  console.log(`Customer connected to /customer-dine-in: ${socket.id}`);

  socket.on("customer-login-opened", async (tableId: number) => {
    socket.join(`dine-in-order-${tableId}-room`);

    // Prefer X-Forwarded-For if set by a proxy (may contain comma-separated list)
    const xff = socket.handshake?.headers?.["x-forwarded-for"];
    let rawIp =
      xff ??
      socket.handshake?.headers?.["cf-connecting-ip"] ??
      socket.handshake?.address;

    if (!rawIp) {
      socket.emit("customer-login-opened-error", new Error("IP not found!"));
      return;
    }

    // if (!rawIp) return "unknown";

    // If it's an array (rare) or comma-separated, take the first entry
    if (Array.isArray(rawIp)) rawIp = rawIp[0];
    if (typeof rawIp === "string" && rawIp.includes(","))
      rawIp = rawIp.split(",")[0];

    // Normalize IPv4-mapped IPv6 format
    rawIp = String(rawIp).trim();
    if (rawIp.startsWith("::ffff:")) rawIp = rawIp.replace("::ffff:", "");

    await saveToCache(
      `dine-in-${tableId}`,
      {
        tableId: tableId,
        ipAddress: rawIp,
        tableStatus: "WaitingForWaiter",
      },
      6 * 3600
    );
    console.log(`cached to: dine-in-${tableId}`);

    // get dining area id
    const dTable = await prisma.diningTable.findFirst({
      include: {
        diningArea: true,
      },
      where: {
        id: tableId,
      },
    });

    if (!dTable) {
      socket.emit(
        "customer-login-opened-error",
        new Error("Invalid table referenced!")
      );
      return;
    }

    const daId = dTable.diningArea.id;

    // send emit to dining area room(waiter is in it)
    const io = getSocketIO();
    io.of("/waiter")
      .to(`dA-${daId}-room`)
      .emit("customer-started-dining", tableId);
    console.log(`emitted to: dA-${daId}-room`);
  });

  //   socket.on(
  //     "customer-login-opened",
  //     async (data: { tableId: string; message: string; timestamp: string }) => {
  //       try {
  //         const tableId = Number(data.tableId);
  //         console.log("Customer started order at table:", tableId);

  //         // Notify all waiters via redis
  //         await publishEvent("customer-started-dining", tableId);
  //         await saveToCache(
  //           `diningTableStatus:${tableId}`,
  //           {
  //             tableId: tableId,
  //             waiterId: null,
  //             status: "WaitingForWaiter",
  //           },
  //           4 * 3600
  //         );
  //       } catch (err) {
  //         console.error(
  //           "Failed to send redis event(customer-started-dining): ",
  //           err
  //         );
  //       }
  //     }
  //   );

  //   socket.on("getWaiterAssignedFlag", async (tableId: number) => {
  //     try {
  //       const cachedSession = await getFromCache<{
  //         status: boolean;
  //       }>(`waiterAssignedFlag:${tableId}`);
  //       console.log("cache eken gaththe: ", cachedSession);
  //       if (!cachedSession) {
  //         socket.emit("waiterAssignedFlag", tableId, false);
  //         return;
  //       }
  //       socket.emit("waiterAssignedFlag", tableId, cachedSession.status);
  //     } catch (error) {
  //       socket.emit("waiterAssignedFlagError", tableId, error);
  //     }
  //   });

  //   const handleWaiterAcceptedTable = async (data: {
  //     tableId: number;
  //     waiterId: number;
  //   }) => {
  //     console.log("Customers received accepted-table event");
  //     socket.emit("accepted-table-customer-emit", data);
  //   };

  //   const eventBusListeners = [
  //     ["accepted-table", handleWaiterAcceptedTable],
  //   ] as const;

  //   for (const [event, handler] of eventBusListeners) {
  //     await subscribeToEvent(event, handler);
  //   }

  socket.on("disconnect", async () => {
    // for (const [event] of eventBusListeners) {
    //   await unsubscribeFromEvent(event);
    // }
    console.log(`Customer disconnected: ${socket.id}`);
    // socket.removeAllListeners();
  });
};
