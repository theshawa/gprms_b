import { StaffMember, TakeAwayOrder, TakeAwayOrderStatusType } from "@prisma/client";
import { Socket } from "socket.io";

export interface KitchenManagerListenEventsMap {
  getNewTakeAwayOrders: (status: TakeAwayOrderStatusType[]) => void;
  // Add other events specific to the cashier namespace here
}

export interface KitchenManagerEmitEventsMap {
  newTakeAwayOrdersResults: (orders: TakeAwayOrder[]) => void; // Replace 'any[]' with
  newTakeAwayOrder: (order: TakeAwayOrder) => void;
}

export type KitchenManagerSocket = Socket<
  KitchenManagerListenEventsMap,
  KitchenManagerEmitEventsMap,
  {},
  {
    user: StaffMember;
  }
>;
