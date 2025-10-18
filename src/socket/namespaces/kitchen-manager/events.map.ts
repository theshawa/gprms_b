import { Order, OrderStatusType, StaffMember, TakeAwayOrder, TakeAwayOrderStatusType } from "@prisma/client";
import { Socket } from "socket.io";

export interface KitchenManagerListenEventsMap {
  getTakeAwayOrders: (status: TakeAwayOrderStatusType[]) => void;
  getDineInOrders: (status: OrderStatusType[]) => void;
  // Add other events specific to the cashier namespace here
}

export interface KitchenManagerEmitEventsMap {
  takeAwayOrdersResults: (orders: TakeAwayOrder[]) => void; // Replace 'any[]' with
  takeAwayOrdersError: (err: any) => void; // Replace 'any[]' with
  newTakeAwayOrder: (order: TakeAwayOrder) => void;
  takeAwayOrderCancelled: (order: TakeAwayOrder) => void;

  dineInOrdersResults: (orders: Order[]) => void; // Replace 'any[]' with
  dineInOrdersError: (err: any) => void; // Replace 'any[]' with
  newDineInOrder: (order: Order) => void;
  dineInOrderCancelled: (order: Order) => void;
}

export type KitchenManagerSocket = Socket<
  KitchenManagerListenEventsMap,
  KitchenManagerEmitEventsMap,
  {},
  {
    user: StaffMember;
  }
>;
