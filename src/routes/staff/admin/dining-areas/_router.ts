import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  assignWaiterHandler,
  assignWaiterHandlerBodySchema,
} from "./assign-waiter";
import {
  createDiningAreaHandler,
  createDiningAreaHandlerBodySchema,
} from "./create";
import { deleteDiningAreaHandler } from "./delete";
import { getDiningAreasHandler } from "./get-all";
import { getAssignedWaitersHandler } from "./get-assigned-waiters";
import {
  unAssignWaiterHandler,
  unAssignWaiterHandlerBodySchema,
} from "./unassign-waiter";
import {
  updateDiningAreaHandler,
  updateDiningAreaHandlerBodySchema,
} from "./update";

export const diningAreasRouter = Router();

diningAreasRouter.post(
  "/",
  bodyValidatorMiddleware(createDiningAreaHandlerBodySchema),
  createDiningAreaHandler
);

diningAreasRouter.get("/", getDiningAreasHandler);

diningAreasRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateDiningAreaHandlerBodySchema),
  updateDiningAreaHandler
);

diningAreasRouter.delete("/:id", deleteDiningAreaHandler);

diningAreasRouter.post(
  "/assign-waiter",
  bodyValidatorMiddleware(assignWaiterHandlerBodySchema),
  assignWaiterHandler
);

diningAreasRouter.post(
  "/unassign-waiter",
  bodyValidatorMiddleware(unAssignWaiterHandlerBodySchema),
  unAssignWaiterHandler
);

diningAreasRouter.get(
  "/assigned-waiters/:diningTableId",
  getAssignedWaitersHandler
);
