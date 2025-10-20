import { prisma } from "@/prisma";
import { RequestHandler } from "express";

interface QueryParams {
  date?: string;
}

export const getReservationsByDateHandler: RequestHandler<
  {},
  {},
  {},
  QueryParams
> = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    console.log("Received date query:", date);

    // Parse the date string as YYYY-MM-DD and create UTC start/end of day
    // This ensures we match the date regardless of server timezone
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log("Query range:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        diningArea: true,
      },
      orderBy: {
        reservationDate: "asc",
      },
    });

    console.log(`Found ${reservations.length} reservations for ${date}`);
    if (reservations.length > 0) {
      console.log("First reservation:", {
        id: reservations[0].id,
        code: reservations[0].reservationCode,
        date: reservations[0].reservationDate,
      });
    }

    return res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations by date:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
    });
  }
};
