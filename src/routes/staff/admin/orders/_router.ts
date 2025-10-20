import { Router } from "express";
import { getDineInOrdersHandler } from "./get-dine-in-orders";
import { getTakeAwayOrdersHandler } from "./get-take-away-orders";

export const ordersRouter = Router();

ordersRouter.get("/dine-in", getDineInOrdersHandler);
ordersRouter.get("/take-away", getTakeAwayOrdersHandler);
