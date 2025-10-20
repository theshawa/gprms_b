import { Router } from "express";
import { createClosedDayHandler } from "./create-closed-day";
import { createClosedDaysRangeHandler } from "./create-closed-days-range";
import { deleteClosedDayHandler } from "./delete-closed-day";
import { getClosedDaysHandler } from "./get-closed-days";
import { getReservationsByDateHandler } from "./get-reservations-by-date";

export const adminCalendarRouter = Router();

adminCalendarRouter.get("/reservations", getReservationsByDateHandler);
adminCalendarRouter.get("/closed-days", getClosedDaysHandler);
adminCalendarRouter.post("/closed-days", createClosedDayHandler);
adminCalendarRouter.post("/closed-days/range", createClosedDaysRangeHandler);
adminCalendarRouter.delete("/closed-days/:id", deleteClosedDayHandler);
