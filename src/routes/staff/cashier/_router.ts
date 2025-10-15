import { Router } from "express";
import { cancelTakeAwayOrderHandler } from "./cancel-take-away-order";
import { completeTakeAwayOrderHandler } from "./complete-take-away-order";

export const cashierRouter = Router();

cashierRouter.put("/cancel-take-away-order/:id", cancelTakeAwayOrderHandler);
cashierRouter.put("/complete-take-away-order/:id", completeTakeAwayOrderHandler);
