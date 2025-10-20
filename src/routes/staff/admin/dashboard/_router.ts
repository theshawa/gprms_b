import { Router } from "express";
import { getAdminDashboardStatsHandler } from "./get-stats";
import { getRecentOrdersHandler } from "./get-recent-orders";
import { getDishesHandler } from "./get-dishes";
import { getStaffMembersHandler } from "./get-staff";

const router = Router();

router.get("/stats", getAdminDashboardStatsHandler);
router.get("/recent-orders", getRecentOrdersHandler);
router.get("/dishes", getDishesHandler);
router.get("/staff", getStaffMembersHandler);

export default router;
