import { DiningTable, StaffMember } from "@prisma/client";

export interface WaiterListenEventsMap {
  getDiningTables: () => void;
  getDiningTableStatus: (tableId: number) => void;
  getOngoingOrdersCount: (waiterId: number) => void;
  "customer-login-notification": (data: {
    tableNo: string;
    message: string;
    timestamp: string;
  }) => void;
  waiterAcceptedTable: (data: any) => void;
  // Add other events specific to the waiter namespace here
}

export interface WaiterEmitEventsMap {
  diningTables: (tables: DiningTable[]) => void; // Replace 'any[]' with
  diningTablesError: (error: any) => void;
  diningTableStatus: (talbeId: number, status: string | null) => void;
  diningTableStatusError: (talbeId: number, error: any) => void;
  ongoingOrdersCount: (count: number) => void;
  ongoingOrdersCountError: (error: any) => void;
  customerWaitingAtDiningTable: (data: {
    tableId: number;
    diningAreaId: number; // Assuming diningAreaId is the same as diningTableId for this example
  }) => void;
  "customer-waiting": (msg: string) => void;
  "customer-waiting-error": (error: any) => void;
}

export type WaiterSocket = import("socket.io").Socket<
  WaiterListenEventsMap,
  WaiterEmitEventsMap,
  {},
  { user: StaffMember }
>;
