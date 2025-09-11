import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  createReservationHandler,
  createReservationHandlerBodySchema,
} from "./create";
import { getReservationsByPhoneHandler } from "./get-by-phone";

export const reservationRouter = Router();

// Create new reservation
reservationRouter.post(
  "/",
  bodyValidatorMiddleware(createReservationHandlerBodySchema),
  createReservationHandler
);

// Get reservations by phone number
reservationRouter.get("/phone/:phoneNumber", getReservationsByPhoneHandler);
