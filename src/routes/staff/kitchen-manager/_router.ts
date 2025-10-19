import { Router } from "express";
import { getIngredientsHandler } from "./get-ingredients";
import { getOrdersHandler } from "./get-orders";
import { markakeAwayOrderPreparedHandler } from "./mark-take-away-order-prepared";
import { markTakeAwayOrderPreparingHandler } from "./mark-take-away-order-preparing";
import { markOrderPreparingHandler } from "./mark-order-preparing";
import { markOrderPreparedHandler } from "./mark-order-prepared";
import { getDishsHandler } from "./get-dishes";

export const kitchenManagerRouter = Router();

kitchenManagerRouter.get("/orders", getOrdersHandler);
kitchenManagerRouter.get("/ingredients", getIngredientsHandler);
kitchenManagerRouter.get("/dishes", getDishsHandler);
kitchenManagerRouter.put("/mark-take-away-order-preparing/:id", markTakeAwayOrderPreparingHandler);
kitchenManagerRouter.put("/mark-take-away-order-prepared/:id", markakeAwayOrderPreparedHandler);
kitchenManagerRouter.put("/mark-order-preparing/:id", markOrderPreparingHandler);
kitchenManagerRouter.put("/mark-order-prepared/:id", markOrderPreparedHandler);
