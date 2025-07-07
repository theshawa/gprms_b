import { Router } from "express";
import { bodyValidatorMiddleware } from "../../../middlewares/body-validator";
import {
  createStaffMemberHandler,
  createStaffMemberHandlerBodySchema,
} from "./create-staff-member";
import { deleteStaffMemberHandler } from "./delete-staff-member";
import { getActivityLogsHandler } from "./get-activity-logs";
import { getStaffMembersHandler } from "./get-staff-members";
import {
  updateStaffMemberHandler,
  updateStaffMemberHandlerBodySchema,
} from "./update-staff-member";

export const adminRouter = Router();

adminRouter.post(
  "/create-staff-member",
  bodyValidatorMiddleware(createStaffMemberHandlerBodySchema),
  createStaffMemberHandler
);
adminRouter.put(
  "/update-staff-member/:id",
  bodyValidatorMiddleware(updateStaffMemberHandlerBodySchema),
  updateStaffMemberHandler
);
adminRouter.delete("/delete-staff-member/:id", deleteStaffMemberHandler);

adminRouter.get("/staff-members", getStaffMembersHandler);
adminRouter.get("/activity-logs/:staffMemberId", getActivityLogsHandler);
