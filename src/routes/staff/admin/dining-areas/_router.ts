import { Router } from "express";
import { bodyValidatorMiddleware } from "../../../../middlewares/body-validator";
import {
  createDiningAreaHandler,
  createDiningAreaHandlerBodySchema,
} from "./create";
import { deleteDiningAreaHandler } from "./delete";
import { getDiningAreasHandler } from "./get-all";
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
diningAreasRouter.delete("/:id", deleteDiningAreaHandler);
diningAreasRouter.get("/", getDiningAreasHandler);
diningAreasRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateDiningAreaHandlerBodySchema),
  updateDiningAreaHandler
);
