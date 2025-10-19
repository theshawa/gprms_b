import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import {
  createPayrollRecordBodySchema,
  createPayrollRecordHandler,
} from "./create-payroll-record";
import { getAllPayrollsHandler } from "./get-all-payrolls";
import { getAllStaffConfigsHandler } from "./get-all-staff-configs";
import { markRecordAsPaidHandler } from "./mark-record-as-paid";
import {
  updatePayrollRecordBodySchema,
  updatePayrollRecordHandler,
} from "./update-payroll-record";
import {
  updateStaffConfigBodySchema,
  updateStaffConfigHandler,
} from "./update-staff-config";

export const payrollRouter = Router();

// Staff config routes
payrollRouter.get("/configs", getAllStaffConfigsHandler);
payrollRouter.put(
  "/config/:staffId",
  bodyValidatorMiddleware(updateStaffConfigBodySchema),
  updateStaffConfigHandler
);

// Payroll record routes
payrollRouter.get("/records", getAllPayrollsHandler);
payrollRouter.post(
  "/record",
  bodyValidatorMiddleware(createPayrollRecordBodySchema),
  createPayrollRecordHandler
);
payrollRouter.put(
  "/record/:recordId",
  bodyValidatorMiddleware(updatePayrollRecordBodySchema),
  updatePayrollRecordHandler
);
payrollRouter.post("/record/:recordId/mark-paid", markRecordAsPaidHandler);
