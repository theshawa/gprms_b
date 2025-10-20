import { prisma } from "@/prisma";
import { getFromCache, saveToCache } from "@/redis/storage";
import { Socket } from "socket.io";
import { getSocketIO } from "../io";
import { getDiningTables } from "./helpers/get-dining-tables";

export const registerWaiterHandlers = (socket: Socket) => {
  socket.on("waiter-id", async (waiterId: number) => {
    const diningAreas = await prisma.waiterAssignment.findMany({
      where: { waiterId },
      select: { diningAreaId: true },
    });

    for (const { diningAreaId } of diningAreas) {
      socket.join(`dA-${diningAreaId}-room`);
      console.log(`Waiter ${waiterId} joined dA-${diningAreaId}-room`);
    }
  });

  socket.on("getDiningTables", async () => {
    const user = socket.data.user;

    try {
      const diningTables = await getDiningTables(user.id);
      for (const dt of diningTables) {
        const cache = await getFromCache<{
          tableId: number;
          ipAddress: string;
          tableStatus: string;
          waiterId?: string;
        }>(`dine-in-${dt.id}`);
        let tableStatus = null;
        if (cache?.tableStatus === "WaitingForWaiter") {
          tableStatus = "WaitingForWaiter";
        } else if (cache?.tableStatus === "Dining") {
          tableStatus = cache.waiterId === user.id ? "Dining" : "Occupied";
        }
        Object.assign(dt, { tableStatus });
      }
      console.log({ diningTables });

      socket.emit("diningTables", diningTables);
    } catch (error) {
      socket.emit("diningTablesError", error);
    }
  });

  socket.on(
    "waiter-accepted-table",
    async ({ tableId, waiterId }: { tableId: string; waiterId: string }) => {
      const cachedSession = await getFromCache<{
        tableId: number;
        ipAddress: string;
      }>(`dine-in-${tableId}`);

      const diningTable = await prisma.diningTable.findFirst({
        where: {
          id: Number(tableId),
        },
        include: {
          diningArea: true,
        },
      });

      if (!diningTable) {
        socket.emit(
          "waiter-accepted-table-error",
          new Error("invalid dining area")
        );
        return;
      }

      await saveToCache(
        `dine-in-${tableId}`,
        {
          tableId: tableId,
          ipAddress: cachedSession?.ipAddress ?? "unknown",
          tableStatus: "Dining",
          waiterId,
        },
        6 * 3600
      );

      socket.join(`dine-in-order-${tableId}-room`);

      const io = getSocketIO();
      // send to customer dine-in namespace
      io.of("/customer-dine-in")
        .to(`dine-in-order-${tableId}-room`)
        .emit("accepted-table", tableId);
      // send to all other waiters in the dining area room
      io.of("/waiter")
        .to(`dA-${diningTable.diningArea.id}-room`)
        .emit("accepted-table", { tableId, waiterId });
    }
  );

  socket.on("disconnect", async () => {
    console.log(`Waiter disconnected: ${socket.id}`);
  });
};
