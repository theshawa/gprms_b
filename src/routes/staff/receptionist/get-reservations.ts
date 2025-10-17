import { prisma } from "@/prisma";
import { Reservation, ReservationStatus } from "@prisma/client";
import { RequestHandler } from "express";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ReservationQueryParams {
  page?: string;
  limit?: string;
  diningAreaId?: string;
  date?: string;
  customerName?: string;
  customerPhone?: string;
  status?: ReservationStatus;
  meal?: string;
}

export const getReservationsHandler: RequestHandler<
  {},
  PaginatedResponse<Reservation>,
  {},
  ReservationQueryParams
> = async (req, res) => {
  const {
    page = "1",
    limit = "10",
    diningAreaId,
    date,
    customerName,
    customerPhone,
    status,
    meal,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  // Build where clause based on filters
  const whereClause: any = {};

  if (diningAreaId) {
    whereClause.diningAreaId = parseInt(diningAreaId);
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    whereClause.reservationDate = {
      gte: startDate,
      lt: endDate,
    };
  }

  if (customerName) {
    whereClause.OR = [
      {
        customerName: {
          contains: customerName,
          mode: "insensitive",
        },
      },
      {
        customerPhone: {
          contains: customerName,
        },
      },
      {
        reservationCode: {
          contains: customerName,
          mode: "insensitive",
        },
      },
      {
        diningArea: {
          name: {
            contains: customerName,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (customerPhone && !customerName) {
    whereClause.customerPhone = {
      contains: customerPhone,
    };
  }

  if (status) {
    whereClause.status = status;
  }

  if (meal) {
    whereClause.meal = meal;
  }

  // Get total count for pagination
  const total = await prisma.reservation.count({
    where: whereClause,
  });

  // Get paginated reservations
  const reservations = await prisma.reservation.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc", // Most recent first
    },
    include: {
      diningArea: true,
    },
    skip,
    take: limitNum,
  });

  const totalPages = Math.ceil(total / limitNum);

  const response: PaginatedResponse<Reservation> = {
    data: reservations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };

  res.status(200).json(response);
};
