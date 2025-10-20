import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { startOfDay, endOfDay } from "date-fns";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  totalTables: number;
}

export const getAdminDashboardStatsHandler: RequestHandler<
  {},
  DashboardStats,
  {}
> = async (req, res) => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Get today's order count (both dine-in and take-away)
  const [dineInOrdersCount, takeAwayOrdersCount] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
    prisma.takeAwayOrder.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
  ]);

  const todayOrders = dineInOrdersCount + takeAwayOrdersCount;

  // Calculate today's revenue (from completed orders)
  const [dineInOrders, takeAwayOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: "Completed",
      },
      select: {
        totalAmount: true,
      },
    }),
    prisma.takeAwayOrder.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: "Completed",
      },
      select: {
        totalAmount: true,
      },
    }),
  ]);

  const dineInRevenue = dineInOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const takeAwayRevenue = takeAwayOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const todayRevenue = dineInRevenue + takeAwayRevenue;

  // Get total tables count in the system
  const totalTables = await prisma.diningTable.count();

  res.json({
    todayOrders,
    todayRevenue,
    totalTables,
  });
};
