import { Router } from "express";
import { diningAreasRouter } from "./dining-areas/_router";
import { staffRouter } from "./staff/_router";

export const adminRouter = Router();

adminRouter.use("/staff", staffRouter);
adminRouter.use("/dining-areas", diningAreasRouter);
