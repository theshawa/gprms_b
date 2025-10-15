import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import { getAllDishesHandler } from "./get-all-dishes";
import { placeOrderHandler, placeOrderHandlerBodySchema } from "./place-order";

export const takeawayRouter = Router();

takeawayRouter.get("/dishes", getAllDishesHandler);
takeawayRouter.post(
  "/place-order",
  bodyValidatorMiddleware(placeOrderHandlerBodySchema),
  placeOrderHandler
);
