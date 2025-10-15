import { Router } from "express";
import { getOrdersHandler } from "./get-orders";
import { markakeAwayOrderPreparedHandler } from "./mark-take-away-order-prepared";
import { markTakeAwayOrderPreparingHandler } from "./mark-take-away-order-preparing";

export const kitchenManagerRouter = Router();

kitchenManagerRouter.get("/orders", getOrdersHandler);
kitchenManagerRouter.put("/mark-take-away-order-preparing/:id", markTakeAwayOrderPreparingHandler);
kitchenManagerRouter.put("/mark-take-away-order-prepared/:id", markakeAwayOrderPreparedHandler);
