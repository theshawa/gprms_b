import { Router } from "express";
import { completeOrderHandler } from "./complete-order";
import { createOrderHandler } from "./create-order";

export const testRouter = Router();

testRouter.post("/create-order/:diningTableId", createOrderHandler);
testRouter.post("/complete-order/:diningTableId", completeOrderHandler);
