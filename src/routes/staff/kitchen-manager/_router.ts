import { Router } from "express";
import { getOrdersHandler } from "./get-orders";
import { getIngredientsHandler } from "./get-ingredients";
import { getAllDishesHandler } from "../admin/dishes/get-all";

export const kitchenManagerRouter = Router();

kitchenManagerRouter.get("/orders", getOrdersHandler);
kitchenManagerRouter.get("/ingredients", getIngredientsHandler);
kitchenManagerRouter.get("/dishes", getAllDishesHandler);
