import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { multerFileUpload } from "@/multer";
import { Router } from "express";
import { assignWaiterHandler, assignWaiterHandlerBodySchema } from "./assign-waiter";
import { createDiningAreaHandler } from "./create";
import { deleteDiningAreaHandler } from "./delete";
import { getDiningAreasHandler } from "./get-all";
import { getAssignedWaitersHandler } from "./get-assigned-waiters";
import { unAssignWaiterHandler, unAssignWaiterHandlerBodySchema } from "./unassign-waiter";
import { updateDiningAreaHandler } from "./update";

export const diningAreasRouter = Router();

diningAreasRouter.post("/", multerFileUpload.single("image"), createDiningAreaHandler);

diningAreasRouter.get("/", getDiningAreasHandler);

diningAreasRouter.put("/:id", multerFileUpload.single("image"), updateDiningAreaHandler);

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

diningAreasRouter.get("/assigned-waiters/:diningTableId", getAssignedWaitersHandler);
