import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import { createMenuHandler, createMenuHandlerBodySchema } from "./create";
import { deleteMenuHandler } from "./delete";
import { getAllMenusHandler } from "./get-all";
import {
  setMenuForMealHandler,
  setMenuForMealHandlerBodySchema,
} from "./set-menu-for-meal";
import { updateMenuHandler, updateMenuHandlerBodySchema } from "./update";

export const menusRouter = Router();

menusRouter.post(
  "/",
  bodyValidatorMiddleware(createMenuHandlerBodySchema),
  createMenuHandler
);

menusRouter.get("/", getAllMenusHandler);

menusRouter.put(
  "/:menuId",
  bodyValidatorMiddleware(updateMenuHandlerBodySchema),
  updateMenuHandler
);

menusRouter.delete("/:menuId", deleteMenuHandler);

menusRouter.post(
  "/set-menu-for-meal/:meal",
  bodyValidatorMiddleware(setMenuForMealHandlerBodySchema),
  setMenuForMealHandler
);
