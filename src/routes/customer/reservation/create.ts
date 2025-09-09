import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { Reservation, ReservationStatus } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";


export const createReservationHandlerBodySchema = z.object({
    // Customer details
    customerName: z.string().trim().nonempty("Customer name is required"),
    phoneNumber: z.string().trim().nonempty("Phone number is required"),

    // Reservation Details
    reservationDate: z.string().datetime("Invalid date format"),
    timeSlot: z.string().trim().nonempty("Time slot is required"),
    guestCount: z.number().min(1, "At least 1 guest is required").max(20, "Maximum 20 guests allowed"),
    meal: z.enum(["Brunch", "Lunch", "HighTea", "Dinner"]),

    // Optional details
    diningAreaId: z.number().optional(),
    specialRequests: z.string().trim().max(500).optional(),

});

export const createReservationHandler: RequestHandler<
{}, 
{reservation: Reservation; message: string},
z.infer<typeof createReservationHandlerBodySchema>
> = async (req, res) => {
    const {
        phoneNumber,
        customerName,
        reservationDate,
        timeSlot,
        guestCount,
        meal,
        diningAreaId,
        specialRequests,
    } = req.body;
}

try {
    // Step 1: Check if reservation date is in the future
    const reservationDateTime = new Date(reservationDate);
    const now = new Date();

    if (reservationDateTime <= now) {
        throw new Exception(
            StatusCodes.BAD_REQUEST,
            "Reservation date must be in the future"
        );
    }

    // Step 2: Check for duplicate reservations (same phone, same date/time)
    const existingReservation = await prisma.reservation.findFirst({
        where: {
            phoneNumber: phoneNumber,
            reservationDate: reservationDateTime,
            status: {
                in: [ReservationStatus.Pending, ReservationStatus.Confirmed],
            },
        },
    });

    if (existingReservation) {
        throw new Exception(
            StatusCodes.CONFLICT,
            "You already have a reservation at this date and time"
        )
    }

    // Step 3: Find or create customer
    let customer = await prisma.customer.findUnique({
        where: {phoneNumber},
    });

    if(!customer) {
        // Create new customer
        customer = await prisma.customer.create({
            data: {
                name: customerName,
                phoneNumber: phoneNumber,
                loyaltyPoints: 0,
            }
        });
    } else {
        // Update customer name if different
        if (customer.name !== customerName) {
            
        }
    }


}