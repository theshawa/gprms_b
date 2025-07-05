import { Router } from "express";
import { bodyValidatorMiddleware } from "../../../middlewares/body-validator";
import {
  createStaffMemberHandler,
  createStaffMemberHandlerBodySchema,
} from "./create-staff-member";
import { getActivityLogsHandler } from "./get-activity-logs";

export const adminRouter = Router();

adminRouter.get("/activity-logs/:staffMemberId", getActivityLogsHandler);
adminRouter.post(
  "/create-staff-member",
  bodyValidatorMiddleware(createStaffMemberHandlerBodySchema),
  createStaffMemberHandler
);
