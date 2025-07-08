import { Router } from "express";
import { bodyValidatorMiddleware } from "../../../../middlewares/body-validator";
import {
  createLocationHandler,
  createLocationHandlerBodySchema,
} from "./create-location";
import { deleteLocationHandler } from "./delete-location";
import { getLocationsHandler } from "./get-locations";
import {
  updateLocationHandler,
  updateLocationHandlerBodySchema,
} from "./update-location";

export const locationRouter = Router();

locationRouter.post(
  "/",
  bodyValidatorMiddleware(createLocationHandlerBodySchema),
  createLocationHandler
);
locationRouter.delete("/:id", deleteLocationHandler);
locationRouter.get("/", getLocationsHandler);
locationRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateLocationHandlerBodySchema),
  updateLocationHandler
);
