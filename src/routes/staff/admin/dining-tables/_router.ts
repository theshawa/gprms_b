import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  createDiningTableHandler,
  createDiningTableHandlerBodySchema,
} from "./create";
import { deleteDiningTableHandler } from "./delete";
import { getAllDiningTablesHandler } from "./get-all";
import {
  updateDiningTableHandler,
  updateDiningTableHandlerBodySchema,
} from "./update";

export const diningTablesRouter = Router();

diningTablesRouter.post(
  "/",
  bodyValidatorMiddleware(createDiningTableHandlerBodySchema),
  createDiningTableHandler
);

diningTablesRouter.get("/", getAllDiningTablesHandler);

diningTablesRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateDiningTableHandlerBodySchema),
  updateDiningTableHandler
);

diningTablesRouter.delete("/:id", deleteDiningTableHandler);
