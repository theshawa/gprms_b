import { Router } from "express";
import { cancelReservationHandler } from "./cancel-reservation";
import { completeReservationHandler } from "./complete-reservation";
import { getReservationsHandler } from "./get-reservations";

export const receptionistRouter = Router();

receptionistRouter.get("/reservations", getReservationsHandler);
receptionistRouter.post("/reservations/cancel/:id", cancelReservationHandler);
receptionistRouter.post("/reservations/complete/:id", completeReservationHandler);
