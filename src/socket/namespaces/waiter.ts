import { prisma } from "@/prisma";
import { getFromCache, saveToCache } from "@/redis/storage";
import { Socket } from "socket.io";
import { getSocketIO } from "../io";
import { getDiningTables } from "./helpers/get-dining-tables";

export const registerWaiterHandlers = async (socket: Socket) => {
  console.log(`Waiter connected: ${socket.id}`);

  const waiterId = socket.data.user.id;

  const diningAreas = await prisma.waiterAssignment.findMany({
    where: { waiterId },
    select: { diningAreaId: true },
  });

  for (const { diningAreaId } of diningAreas) {
    socket.join(`dA-${diningAreaId}-room`);
    console.log(`Waiter ${waiterId} joined dA-${diningAreaId}-room`);
  }

  socket.on("getDiningTables", async () => {
    console.log("working");
    const user = socket.data.user;

    try {
      const diningTables = await getDiningTables(user.id);
      socket.emit("diningTables", diningTables);
    } catch (error) {
      socket.emit("diningTablesError", error);
    }
  });

  socket.on("waiter-accepted-table", async (tableId: number) => {
    const cachedSession = await getFromCache<{
      tableId: number;
      ipAddress: string;
    }>(`dine-in-${tableId}`);

    await saveToCache(
      `dine-in-${tableId}`,
      {
        tableId: tableId,
        ipAddress: cachedSession?.ipAddress ?? "unknown",
        acceptedByWaiter: true,
      },
      6 * 3600
    );

    const io = getSocketIO();
    io.of("/customer-dine-in")
      .to(`dine-in-order-${tableId}-room`)
      .emit("accepted-table", tableId);
    io.of("/waiter")
      .to(`dine-in-order-${tableId}-room`)
      .emit("accepted-table", tableId);
  });

  socket.on("getDiningTableStatus", async (tableId: number) => {
    try {
      const cachedSession = await getFromCache<{
        tableId: number;
        ipAddress: string;
        tableStatus: string;
      }>(`dine-in-${tableId}`);
      socket.emit("diningTableStatus", cachedSession?.tableStatus);
      console.log("status: ", cachedSession?.tableStatus);
    } catch (err) {
      socket.emit("diningTableStatusError", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log(`Waiter disconnected: ${socket.id}`);
  });
};
