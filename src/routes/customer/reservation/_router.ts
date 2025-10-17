import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import { getReservationsByPhoneHandler } from "./get-dining-areas";
import { placeReservationHandler, placeReservationHandlerBodySchema } from "./place-reservation";
import { sendVerificationCodeHandler, sendVerificationCodeSchema } from "./send-verification-code";
import {
  verifyPhoneNumberAndPlaceReservationHandler,
  verifyPhoneNumberAndPlaceReservationHandlerBodySchema,
} from "./verify-phone-number-and-place-reservation";

export const reservationRouter = Router();

reservationRouter.get("/dining-areas", getReservationsByPhoneHandler);
reservationRouter.post(
  "/send-verification-code",
  bodyValidatorMiddleware(sendVerificationCodeSchema),
  sendVerificationCodeHandler
);
reservationRouter.post(
  "/place-reservation",
  bodyValidatorMiddleware(placeReservationHandlerBodySchema),
  placeReservationHandler
);

reservationRouter.post(
  "/verify-phone-number-and-place-reservation",
  bodyValidatorMiddleware(verifyPhoneNumberAndPlaceReservationHandlerBodySchema),
  verifyPhoneNumberAndPlaceReservationHandler
);
