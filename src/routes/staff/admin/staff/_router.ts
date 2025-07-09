import { Router } from "express";
import { bodyValidatorMiddleware } from "../../../../middlewares/body-validator";
import {
  createStaffMemberHandler,
  createStaffMemberHandlerBodySchema,
} from "./create-staff-member";
import { deleteActivityLogsHandler } from "./delete-activity-logs";
import { deleteStaffMemberHandler } from "./delete-staff-member";
import { getActivityLogsHandler } from "./get-activity-logs";
import { getStaffMembersHandler } from "./get-staff-members";
import {
  updateStaffMemberHandler,
  updateStaffMemberHandlerBodySchema,
} from "./update-staff-member";

export const staffRouter = Router();

staffRouter.post(
  "/",
  bodyValidatorMiddleware(createStaffMemberHandlerBodySchema),
  createStaffMemberHandler
);
staffRouter.put(
  "/:id",
  bodyValidatorMiddleware(updateStaffMemberHandlerBodySchema),
  updateStaffMemberHandler
);
staffRouter.delete("/:id", deleteStaffMemberHandler);

staffRouter.get("/", getStaffMembersHandler);
staffRouter.get("/activity-logs/:staffMemberId", getActivityLogsHandler);
staffRouter.delete("/activity-logs/:staffMemberId", deleteActivityLogsHandler);
