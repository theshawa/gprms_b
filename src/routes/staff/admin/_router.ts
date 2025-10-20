import { Router } from "express";
import { adminCalendarRouter } from "./calendar/_router";
import { customersRouter } from "./customers/_router";
import dashboardRouter from "./dashboard/_router";
import { diningAreasRouter } from "./dining-areas/_router";
import { diningTablesRouter } from "./dining-tables/_router";
import { dishesRouter } from "./dishes/_router";
import { ingredientsRouter } from "./ingredients/_router";
import { menusRouter } from "./menus/_router";
import { ordersRouter } from "./orders/_router";
import { payrollRouter } from "./payroll/_router";
import { reservationsRouter } from "./reservations/_router";
import { staffRouter } from "./staff/_router";

export const adminRouter = Router();

adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/customers", customersRouter);
adminRouter.use("/reservations", reservationsRouter);
adminRouter.use("/orders", ordersRouter);
adminRouter.use("/calendar", adminCalendarRouter);
adminRouter.use("/staff", staffRouter);
adminRouter.use("/dining-areas", diningAreasRouter);
adminRouter.use("/dining-tables", diningTablesRouter);
adminRouter.use("/ingredients", ingredientsRouter);
adminRouter.use("/dishes", dishesRouter);
adminRouter.use("/menus", menusRouter);
adminRouter.use("/payroll", payrollRouter);
