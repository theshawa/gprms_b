import { Router } from "express";
import { diningAreasRouter } from "./dining-areas/_router";
import { diningTablesRouter } from "./dining-tables/_router";
import { dishesRouter } from "./dishes/_router";
import { ingredientsRouter } from "./ingredients/_router";
import { menusRouter } from "./menus/_router";
import { payrollRouter } from "./payroll/_router";
import { staffRouter } from "./staff/_router";

export const adminRouter = Router();

adminRouter.use("/staff", staffRouter);
adminRouter.use("/dining-areas", diningAreasRouter);
adminRouter.use("/dining-tables", diningTablesRouter);
adminRouter.use("/ingredients", ingredientsRouter);
adminRouter.use("/dishes", dishesRouter);
adminRouter.use("/menus", menusRouter);
adminRouter.use("/payroll", payrollRouter);
