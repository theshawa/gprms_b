import { Socket } from "socket.io";

export interface CustomerDineInListenEventsMap {
  // Add other events specific to the customer dine-in namespace here
  "customer-login-opened": (data: {
    tableId: string;
    message: string;
    timestamp: string;
  }) => void;
  getWaiterAssignedFlag: (tableId: number) => void;
}

export interface CustomerDineInEmitEventsMap {
  "accepted-table-customer-emit": (data: {
    tableId: number;
    waiterId: number;
  }) => void;
  waiterAssignedFlag: (tableId: number, status: boolean) => void;
  waiterAssignedFlagError: (tableId: number, error: any) => void;
}

export type CustomerDineInSocket = Socket<
  CustomerDineInListenEventsMap,
  CustomerDineInEmitEventsMap,
  {},
  {}
>;
