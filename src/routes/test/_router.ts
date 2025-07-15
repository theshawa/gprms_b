import { Router } from "express";
import { startOrderHandler } from "./start-order";

export const testRouter = Router();

testRouter.post("/start-order/:diningTableId", startOrderHandler);
