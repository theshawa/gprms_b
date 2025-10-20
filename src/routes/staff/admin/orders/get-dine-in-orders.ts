import { prisma } from "@/prisma";
import { RequestHandler } from "express";

interface QueryParams {
  date?: string;
  month?: string;
  year?: string;
}

export const getDineInOrdersHandler: RequestHandler<
  {},
  {},
  {},
  QueryParams
> = async (req, res) => {
  const { date, month, year } = req.query;

  const whereClause: any = {};

  // Filter by specific date
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    whereClause.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }
  // Filter by month and year
  else if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 1);

    whereClause.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      },
      waiter: {
        select: {
          id: true,
          username: true,
        },
      },
      orderItems: {
        include: {
          dish: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.json(orders);
};
