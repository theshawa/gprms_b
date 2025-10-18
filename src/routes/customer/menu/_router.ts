import { Router } from "express";
import { getDishesHandler } from "./get-dishes";
import { getDishHandler } from "./get-dish";
import { placeOrderHandler } from "./place-order";
import { getOrderHandler } from "./get-order";

export const menuRouter = Router();

// get all dishes
menuRouter.get("/dishes", getDishesHandler);
menuRouter.get("/dishes/:dishId", getDishHandler);
menuRouter.post("/orders", placeOrderHandler);
menuRouter.get("/orders/:orderCode", getOrderHandler);