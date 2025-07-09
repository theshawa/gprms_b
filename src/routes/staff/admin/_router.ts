import { Router } from "express";
import { locationRouter } from "./location/_router";
import { staffRouter } from "./staff/_router";

export const adminRouter = Router();

adminRouter.use("/staff", staffRouter);
adminRouter.use("/locations", locationRouter);
