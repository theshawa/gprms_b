import { Router } from "express";
import { getIngredientsHandler } from "./get-ingredients";
import { getOrdersHandler } from "./get-orders";
import { markakeAwayOrderPreparedHandler } from "./mark-take-away-order-prepared";
import { markTakeAwayOrderPreparingHandler } from "./mark-take-away-order-preparing";
import { getDishesHandler } from "@/routes/customer/menu/get-dishes";

export const kitchenManagerRouter = Router();

kitchenManagerRouter.get("/orders", getOrdersHandler);
kitchenManagerRouter.get("/ingredients", getIngredientsHandler);
kitchenManagerRouter.get("/dishes", getDishesHandler);
kitchenManagerRouter.put("/mark-take-away-order-preparing/:id", markTakeAwayOrderPreparingHandler);
kitchenManagerRouter.put("/mark-take-away-order-prepared/:id", markakeAwayOrderPreparedHandler);
