import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  createIngredientHandler,
  createIngredientHandlerBodySchema,
} from "./create";
import {
  createStockMovementHandler,
  createStockMovementHandlerBodySchema,
} from "./create-stock-movement";
import { deleteIngredientHandler } from "./delete";
import { deleteStockMovementsHandler } from "./delete-stock-movements";
import { getAllIngredientsHandler } from "./get-all";
import { getStockMovementsHandler } from "./get-stock-movements";
import {
  updateIngredientHandler,
  updateIngredientHandlerBodySchema,
} from "./update";

export const ingredientsRouter = Router();

ingredientsRouter.post(
  "/",
  bodyValidatorMiddleware(createIngredientHandlerBodySchema),
  createIngredientHandler
);
ingredientsRouter.get("/", getAllIngredientsHandler);
ingredientsRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateIngredientHandlerBodySchema),
  updateIngredientHandler
);
ingredientsRouter.delete("/:id", deleteIngredientHandler);
ingredientsRouter.get(
  "/stock-movements/:ingredientId",
  getStockMovementsHandler
);
ingredientsRouter.post(
  "/stock-movements",
  bodyValidatorMiddleware(createStockMovementHandlerBodySchema),
  createStockMovementHandler
);
ingredientsRouter.delete(
  "/stock-movements/:ingredientId",
  deleteStockMovementsHandler
);
