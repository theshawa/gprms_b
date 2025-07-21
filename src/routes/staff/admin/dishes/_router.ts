import { multerFileUpload } from "@/multer";
import { Router } from "express";
import { createDishHandler } from "./create";
import { deleteDishHandler } from "./delete";
import { getAllDishesHandler } from "./get-all";
import { updateDishHandler } from "./update";

export const dishesRouter = Router();

dishesRouter.post("/", multerFileUpload.single("image"), createDishHandler);

dishesRouter.get("/", getAllDishesHandler);

dishesRouter.put(
  "/:dishId",
  multerFileUpload.single("image"),
  updateDishHandler
);

dishesRouter.delete("/:dishId", deleteDishHandler);
