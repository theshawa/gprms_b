import { Request, Response } from "express";
import { prisma } from "@/prisma";
import { startOfDay, endOfDay } from "date-fns";

interface RecentOrderResponse {
  id: number;
  orderCode: string;
  type: "dine-in" | "take-away";
  tableInfo?: string;
  customerName?: string;
  customerPhone?: string;
  time: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

/**
 * Get recent orders from today (both dine-in and take-away)
 * GET /staff/admin/dashboard/recent-orders
 */
export const getRecentOrdersHandler = async (req: Request, res: Response) => {
  try {
    // Get today's date range
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    // Get today's dine-in orders
    const dineInOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        waiter: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Get latest 10 orders
    });

    // Get today's take-away orders
    const takeAwayOrders = await prisma.takeAwayOrder.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Get latest 10 orders
    });

    // Transform dine-in orders
    const transformedDineInOrders: RecentOrderResponse[] = dineInOrders.map(
      (order) => ({
        id: order.id,
        orderCode: order.orderCode,
        type: "dine-in" as const,
        tableInfo: order.reservationId
          ? `Reservation #${order.reservationId}`
          : "Table",
        customerName: order.customer?.name,
        customerPhone: order.customer?.phoneNumber,
        time: order.createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      })
    );

    // Transform take-away orders
    const transformedTakeAwayOrders: RecentOrderResponse[] =
      takeAwayOrders.map((order) => ({
        id: order.id,
        orderCode: `TA-${order.id}`,
        type: "take-away" as const,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        time: order.createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      }));

    // Combine and sort by created time (most recent first)
    const allOrders = [
      ...transformedDineInOrders,
      ...transformedTakeAwayOrders,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10); // Take only top 10 most recent

    res.json({
      orders: allOrders,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      message: "Failed to fetch recent orders",
    });
  }
};
