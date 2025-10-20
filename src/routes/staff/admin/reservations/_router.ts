import { Router } from "express";
import { getAllReservationsHandler } from "./get-all";

export const reservationsRouter = Router();

reservationsRouter.get("/", getAllReservationsHandler);
