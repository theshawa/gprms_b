import { prisma } from "@/prisma";
import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/redis/events/consumer";
import { deleteFromCache, getFromCache, saveToCache } from "@/redis/storage";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import { WaiterSocket } from "./events.map";
import { getDiningTables } from "./helpers/get-dining-tables";
import { getWaiterAssignments } from "./helpers/get-waiter-assignments";
import { includes } from "zod";
import { StaffRole } from "@prisma/client";
import { publishEvent } from "@/redis/events/publisher";

export const waiterNamespace = io.of("/waiter");

waiterNamespace.on("connection", async (socket: WaiterSocket) => {
  socket.on("getDiningTables", async () => {
    const user = socket.data.user;

    try {
      const diningTables = await getDiningTables(user.id);
      socket.emit("diningTables", diningTables);
    } catch (error) {
      socket.emit("diningTablesError", error);
    }
  });

  socket.on("getDiningTableStatus", async (tableId: number) => {
    try {
      const cachedSession = await getFromCache<{
        waiterId: number;
        status: string;
      }>("diningTableStatus:" + tableId.toString());
      if (!cachedSession) {
        socket.emit("diningTableStatus", tableId, null);
        return;
      }
      socket.emit("diningTableStatus", tableId, cachedSession.status);
    } catch (error) {
      socket.emit("diningTableStatusError", tableId, error);
    }
  });

  // socket.on("getDiningTableStatus", async (tableId: number) => {
  //   const table = await prisma.diningTable.findUnique({
  //     where: { id: tableId },
  //     select: { status: true },
  //   });
  //   socket.emit("diningTableStatus", tableId, table?.status ?? "Available");
  // });

  socket.on("getOngoingOrdersCount", async (waiterId: number) => {
    try {
      const assignments = await getWaiterAssignments(waiterId);
      const count = assignments.length;
      socket.emit("ongoingOrdersCount", count);
    } catch (error) {
      socket.emit("ongoingOrdersCountError", error);
    }
  });

  // socket.on(
  //   "customer-login-notification",
  //   async (data: { tableNo: string; message: string; timestamp: string }) => {
  //     try {
  //       const msg = `New Customer is waiting at table ${data.tableNo}`;
  //       socket.emit("customer-waiting", msg);
  //     } catch (error) {
  //       socket.emit("customer-waiting-error", error);
  //     }
  //   }
  // );

  socket.on(
    "waiter-accepted-table",
    async (data: { tableId: number; waiterId: number }) => {
      try {
        console.log("Waiter accepted table:", data.tableId);

        await publishEvent("accepted-table", {
          tableId: data.tableId,
          waiterId: data.waiterId,
        });
        await deleteFromCache(`diningTableStatus:${data.tableId}`);
        await saveToCache(
          `diningTableStatus:${data.tableId}`,
          {
            tableId: data.tableId,
            waiterId: data.waiterId,
            status: "Dining",
          },
          4 * 3600
        );
      } catch (err) {
        console.error("Failed to publish accepted-table event:", err);
      }
    }
  );

  const handleWaiterAssignmentChange = async (waiterId: number) => {
    if (waiterId !== socket.data.user.id) {
      return;
    }
    try {
      const diningTables = await getDiningTables(waiterId);
      socket.emit("diningTables", diningTables);
    } catch (error) {
      socket.emit("diningTablesError", error);
    }
  };

  const handleDiningAreaChange = async (diningAreaId: number) => {
    try {
      const assignments = await getWaiterAssignments(socket.data.user.id);

      if (assignments.find((a) => a.diningAreaId === diningAreaId)) {
        const diningTables = await getDiningTables(
          socket.data.user.id,
          assignments
        );
        socket.emit("diningTables", diningTables);
      }
    } catch (error) {
      socket.emit("diningTablesError", error);
    }
  };

  const handleOrderStarted = async (diningTableId: number) => {
    console.log("Order started for dining table:", diningTableId);

    try {
      const diningTable = await prisma.diningTable.findUnique({
        where: { id: diningTableId },
        include: {
          diningArea: true,
        },
      });

      if (!diningTable) {
        console.error(`Dining table with ID ${diningTableId} not found`);
        return;
      }

      socket.emit("diningTableStatus", diningTableId, "waiting-for-waiter");
    } catch (error) {
      console.error("Error handling order started:", error);
    }
  };

  const handleOrderEnded = async (diningTableId: number) => {
    console.log("Order ended for dining table:", diningTableId);

    try {
      const diningTable = await prisma.diningTable.findUnique({
        where: { id: diningTableId },
        include: {
          diningArea: true,
        },
      });

      if (!diningTable) {
        console.error(`Dining table with ID ${diningTableId} not found`);
        return;
      }

      socket.emit("diningTableStatus", diningTableId, null);
    } catch (error) {
      console.error("Error handling order ended:", error);
    }
  };

  const handleCustomerStartedDining = async (tableId: number) => {
    console.log("Waiters received customer-started-dining event");

    socket.emit("customer-waiting", tableId);
  };

  const handleWaiterAcceptedTable = async (data: {
    tableId: number;
    waiterId: number;
  }) => {
    console.log("Waiters received accepted-table event");
    socket.emit("accepted-table-emit");
    await saveToCache(
      `waiterAssignedFlag:${data.tableId}`,
      {
        tableId: data.tableId,
        waiterId: data.waiterId,
        status: true,
      },
      4 * 3600
    );
  };

  const eventBusListeners = [
    ["waiter-assigned", handleWaiterAssignmentChange],
    ["waiter-unassigned", handleWaiterAssignmentChange],
    ["dining-area-updated", handleDiningAreaChange],
    ["dining-table-created-in-dining-area", handleDiningAreaChange],
    ["dining-table-deleted-in-dining-area", handleDiningAreaChange],
    ["dining-table-updated-in-dining-area", handleDiningAreaChange],
    ["order-started", handleOrderStarted],
    ["order-ended", handleOrderEnded],
    ["customer-started-dining", handleCustomerStartedDining],
    ["accepted-table", handleWaiterAcceptedTable],
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
});

waiterNamespace.use(staffAuthRequiredMiddleware(StaffRole.Waiter));
