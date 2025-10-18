import { staffAuthRequiredMiddleware } from "@/middlewares/staff-auth-required";
import { Router } from "express";
import { getMyPayrollConfigHandler } from "./get-my-payroll-config";
import { getMyPayrollHistoryHandler } from "./get-my-payroll-history";
import { getMyPayslipHandler } from "./get-my-payslip";

export const commonPayrollRouter = Router();

// Apply auth middleware for all routes (all staff roles except Admin can access)
commonPayrollRouter.use(
  staffAuthRequiredMiddleware(
    "Waiter",
    "Cashier",
    "KitchenManager",
    "Receptionist"
  )
);

commonPayrollRouter.get("/my-config", getMyPayrollConfigHandler);
commonPayrollRouter.get("/my-history", getMyPayrollHistoryHandler);
commonPayrollRouter.get("/my-payslip/:recordId", getMyPayslipHandler);
