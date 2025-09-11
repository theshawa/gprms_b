import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const getReservationsByPhoneHandlerParamsSchema = z.object({
  phoneNumber: z.string().trim().nonempty("Phone number is required"),
});

export const getReservationsByPhoneHandler: RequestHandler<
  z.infer<typeof getReservationsByPhoneHandlerParamsSchema>,
  any,
  {}
> = async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    // First, find the customer by phone number
    const customer = await prisma.customer.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    if (!customer) {
      // If customer doesn't exist, return empty array (no reservations)
      res.json({
        customer: null,
        reservations: [],
        message: "No customer found with this phone number",
      });
      return;
    }

    // Get all reservations for this customer
    const reservations = await prisma.reservation.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            loyaltyPoints: true,
          },
        },
      },
      orderBy: {
        reservationDate: "desc", // Most recent first
      },
    });

    // Separate upcoming and past reservations
    const now = new Date();
    const upcomingReservations = reservations.filter(
      (reservation) => new Date(reservation.reservationDate) >= now
    );
    const pastReservations = reservations.filter(
      (reservation) => new Date(reservation.reservationDate) < now
    );

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        loyaltyPoints: customer.loyaltyPoints,
      },
      reservations: {
        upcoming: upcomingReservations,
        past: pastReservations,
        total: reservations.length,
      },
      summary: {
        totalReservations: reservations.length,
        upcomingCount: upcomingReservations.length,
        pastCount: pastReservations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reservations by phone:", error);
    throw new Exception(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to fetch reservations"
    );
  }
};
