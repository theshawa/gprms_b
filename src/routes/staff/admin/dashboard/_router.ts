import { Router } from "express";
import { getDishesHandler } from "./get-dishes";
import { getRecentOrdersHandler } from "./get-recent-orders";
import { getStaffMembersHandler } from "./get-staff";
import { getAdminDashboardStatsHandler } from "./get-stats";

const router = Router();

router.get("/stats", getAdminDashboardStatsHandler);
router.get("/recent-orders", getRecentOrdersHandler);
router.get("/dishes", getDishesHandler);
router.get("/staff", getStaffMembersHandler);

export default router;
