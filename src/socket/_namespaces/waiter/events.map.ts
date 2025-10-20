import { DiningTable, StaffMember } from "@prisma/client";

export interface WaiterListenEventsMap {
  getDiningTables: () => void;
  getDiningTableStatus: (tableId: number) => void;
  getOngoingOrdersCount: (waiterId: number) => void;
  "waiter-accepted-table": (data: {
    tableId: number;
    waiterId: number;
  }) => void;
  // Add other events specific to the waiter namespace here
}

export interface WaiterEmitEventsMap {
  diningTables: (tables: DiningTable[]) => void; // Replace 'any[]' with
  diningTablesError: (error: any) => void;
  diningTableStatus: (talbeId: number, status: string | null) => void;
  diningTableStatusError: (talbeId: number, error: any) => void;
  ongoingOrdersCount: (count: number) => void;
  ongoingOrdersCountError: (error: any) => void;
  "customer-waiting": (tableId: number) => void;
  "accepted-table-emit": () => void;
}

export type WaiterSocket = import("socket.io").Socket<
  WaiterListenEventsMap,
  WaiterEmitEventsMap,
  {},
  { user: StaffMember }
>;
