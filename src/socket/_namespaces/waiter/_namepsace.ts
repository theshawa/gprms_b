import { prisma } from "@/prisma";
import { subscribeToEvent, unsubscribeFromEvent } from "@/redis/events/consumer";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import { StaffRole } from "@prisma/client";
import { WaiterSocket } from "./events.map";
import { getDiningTables } from "./helpers/get-dining-tables";
import { getWaiterAssignments } from "./helpers/get-waiter-assignments";

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

  // socket.on("getDiningTableStatus", async (tableId: number) => {
  //   try {
  //     const cachedSession = await getFromCache<{
  //       id: string;
  //       status: string;
  //     }>("table-session:" + tableId.toString());
  //     if (!cachedSession) {
  //       socket.emit("diningTableStatus", tableId, null);
  //       return;
  //     }
  //     socket.emit("diningTableStatus", tableId, cachedSession.status);
  //   } catch (error) {
  //     socket.emit("diningTableStatusError", tableId, error);
  //   }
  // });

  socket.on("getDiningTableStatus", async (tableId: number) => {
    const table = await prisma.diningTable.findUnique({
      where: { id: tableId },
      select: { status: true },
    });
    socket.emit("diningTableStatus", tableId, table?.status ?? "Available");
  });

  socket.on("getOngoingOrdersCount", async (waiterId: number) => {
    try {
      const assignments = await getWaiterAssignments(waiterId);
      const count = assignments.length;
      socket.emit("ongoingOrdersCount", count);
    } catch (error) {
      socket.emit("ongoingOrdersCountError", error);
    }
  });

  socket.on(
    "customer-login-notification",
    async (data: { tableNo: string; message: string; timestamp: string }) => {
      try {
        const msg = `New Customer is waiting at table ${data.tableNo}`;
        socket.emit("customer-waiting", msg);
      } catch (error) {
        socket.emit("customer-waiting-error", error);
      }
    }
  );

  socket.on("waiterAcceptedTable", async (data: { tableId: number; waiterId: number }) => {
    try {
      console.log("Waiter accepted table:", data.tableId);

      await prisma.diningTable.update({
        where: { id: data.tableId },
        data: { status: DiningTableStatusType.Dining },
      });

      // await prisma.order.update({})

      io.of("/waiter").emit("diningTableStatusUpdate", {
        tableNo: data.tableId,
        message: "Waiter accepted the table",
      });

      io.of("/customer-dine-in").emit("diningTableStatusUpdate", {
        waiterId: data.waiterId,
        message: "Waiter assigned to your table",
      });
    } catch (err) {
      console.error("Failed to update dining table status:", err);
    }
  });

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
        const diningTables = await getDiningTables(socket.data.user.id, assignments);
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

  const handleWaiterAcceptTable = async (d: { waiterId: number; tableId: number }) => {
    console.log("Waiter accepted table:", d.tableId);

    socket.emit("diningTableStatus", d.tableId, "order-ongoing");
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
});

waiterNamespace.use(staffAuthRequiredMiddleware(StaffRole.Waiter));
