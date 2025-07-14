import { DiningTable } from "@prisma/client";

export interface WaiterListenEventsMap {
  getDiningTables: () => void;
  getDiningTableStatus: (tableId: number) => void;
  getOngoingOrdersCount: (waiterId: number) => void;
  // Add other events specific to the waiter namespace here
}

export interface WaiterEmitEventsMap {
  diningTables: (tables: DiningTable[]) => void; // Replace 'any[]' with
  diningTablesError: (error: any) => void;
  diningTableStatus: (talbeId: number, status: boolean) => void;
  diningTableStatusError: (error: any) => void;
  ongoingOrdersCount: (count: number) => void;
  ongoingOrdersCountError: (error: any) => void;
}
