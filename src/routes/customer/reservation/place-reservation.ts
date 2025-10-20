import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { sendSMS } from "@/twilio";
import { Reservation } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const placeReservationHandlerBodySchema = z.object({
  customerName: z.string().trim().nonempty("Customer name is required"),
  customerPhone: z.string().trim().nonempty("Customer phone is required"),
  diningAreaId: z
    .number()
    .int()
    .positive("Dining area ID must be a positive integer"),
  noOfSeats: z.number().int().min(1, "Number of seats must be at least 1"),
  reservationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid reservation date",
  }),
  notes: z.string().trim().optional(),
  meal: z.enum(["Brunch", "Lunch", "HighTea", "Dinner"]),
});

export const placeReservationHandler: RequestHandler<
  {},
  Reservation,
  z.infer<typeof placeReservationHandlerBodySchema>
> = async (req, res) => {
  const payload = req.body;

  const diningArea = await prisma.diningArea.findUnique({
    where: { id: payload.diningAreaId },
  });
  if (!diningArea) {
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      "Dining area with the given ID does not exist"
    );
  }
  let reservationCode: string = "";
  let isUnique = false;

  while (!isUnique) {
    reservationCode =
      diningArea.name.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.reservation.findUnique({
      where: { reservationCode },
    });
    isUnique = !existing;
  }

  const reservation = await prisma.reservation.create({
    data: {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      diningAreaId: payload.diningAreaId,
      noOfSeats: payload.noOfSeats,
      reservationDate: payload.reservationDate,
      notes: payload.notes || "",
      meal: payload.meal,
      reservationCode,
    },
  });

  // await publishEvent("reservation-placed", {
  //   reservationId: reservation.id,
  // });

  await sendSMS({
    body: `Dear ${reservation.customerName}, your reservation (Code: ${
      reservation.reservationCode
    }) at our ${diningArea.name} on ${new Date(
      reservation.reservationDate
    ).toLocaleString()} for ${
      reservation.noOfSeats
    } seat(s) has been confirmed. We look forward to serving you!`,
    to: reservation.customerPhone,
    whatsapp: true,
  });

  res.json(reservation);
};
