import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import { createDishHandler, createDishHandlerBodySchema } from "./create";
import { deleteDishHandler } from "./delete";
import { getAllDishesHandler } from "./get-all";
import { updateDishHandler, updateDishHandlerBodySchema } from "./update";

export const dishesRouter = Router();

dishesRouter.post(
  "/",
  bodyValidatorMiddleware(createDishHandlerBodySchema),
  createDishHandler
);

dishesRouter.get("/", getAllDishesHandler);

dishesRouter.put(
  "/:dishId",
  bodyValidatorMiddleware(updateDishHandlerBodySchema),
  updateDishHandler
);

dishesRouter.delete("/:dishId", deleteDishHandler);
