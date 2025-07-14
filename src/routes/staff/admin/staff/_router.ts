import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  createStaffMemberHandler,
  createStaffMemberHandlerBodySchema,
} from "./create";
import { deleteStaffMemberHandler } from "./delete";
import { deleteActivityLogsHandler } from "./delete-activity-logs";
import { getActivityLogsHandler } from "./get-activity-logs";
import { getAllStaffMembersHandler } from "./get-all";
import {
  updateStaffMemberHandler,
  updateStaffMemberHandlerBodySchema,
} from "./update";

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

staffRouter.get("/", getAllStaffMembersHandler);
staffRouter.get("/activity-logs/:staffMemberId", getActivityLogsHandler);
staffRouter.delete("/activity-logs/:staffMemberId", deleteActivityLogsHandler);
