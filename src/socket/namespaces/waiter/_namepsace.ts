import { prisma } from "@/prisma";
import {
  subscribeToEvent,
  unsubscribeFromEvent,
} from "@/redis/events/consumer";
import { io } from "@/socket/server";
import { staffAuthRequiredMiddleware } from "@/socket/staff-auth-required-middleware";
import { StaffMember, StaffRole } from "@prisma/client";
import { Socket } from "socket.io";
import { WaiterEmitEventsMap, WaiterListenEventsMap } from "./events.map";
import { getDiningTables } from "./helpers/get-dining-tables";
import { getWaiterAssignments } from "./helpers/get-waiter-assignments";

export const waiterNamespace = io.of("/waiter");

waiterNamespace.on(
  "connection",
  (
    socket: Socket<
      WaiterListenEventsMap,
      WaiterEmitEventsMap,
      {},
      {
        user: StaffMember;
      }
    >
  ) => {
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
        const random = Math.random() < 0.5; // Simulate a random status
        socket.emit("diningTableStatus", tableId, random);
      } catch (error) {
        socket.emit("diningTableStatusError", error);
      }
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

        socket.emit("customerWaitingAtDiningTable", {
          tableId: diningTableId,
          diningAreaId: diningTable.diningArea.id,
        });
      } catch (error) {
        console.error("Error handling order started:", error);
      }
    };

    const eventBusListeners = [
      ["waiter-assigned", handleWaiterAssignmentChange],
      ["waiter-unassigned", handleWaiterAssignmentChange],
      ["dining-area-updated", handleDiningAreaChange],
      ["dining-table-created-in-dining-area", handleDiningAreaChange],
      ["dining-table-deleted-in-dining-area", handleDiningAreaChange],
      ["dining-table-updated-in-dining-area", handleDiningAreaChange],
      ["order-started", handleOrderStarted],
    ] as const;

    eventBusListeners.forEach(([event, handler]) => {
      subscribeToEvent(event, handler);
    });

    socket.on("disconnect", () => {
      eventBusListeners.forEach(([event]) => {
        unsubscribeFromEvent(event);
      });

      socket.removeAllListeners();
    });
  }
);

waiterNamespace.use(staffAuthRequiredMiddleware(StaffRole.Waiter));
