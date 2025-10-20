import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { StaffRole, WaiterAssignment } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const assignWaiterHandlerBodySchema = z.object({
  waiterId: z.number().int().positive("Waiter Id must be a positive integer"),
  diningAreaId: z
    .number()
    .int()
    .positive("Dining Area Id must be a positive integer"),
});

export const assignWaiterHandler: RequestHandler<
  {},
  WaiterAssignment,
  z.infer<typeof assignWaiterHandlerBodySchema>
> = async (req, res) => {
  const currentAssignment = await prisma.waiterAssignment.findFirst({
    where: req.body,
  });

  if (currentAssignment) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "This waiter is already assigned to this dining area"
    );
  }

  const waiter = await prisma.staffMember.findFirst({
    where: {
      id: req.body.waiterId,
      role: StaffRole.Waiter,
    },
  });

  if (!waiter) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Waiter with this ID does not exist"
    );
  }

  const assignment = await prisma.waiterAssignment.create({
    data: req.body,
    include: {
      diningArea: {
        include: {
          assignedWaiters: true,
        },
      },
      waiter: {
        include: {
          assignedDiningAreas: true,
        },
      },
    },
  });

  // await publishEvent("waiter-assigned", waiter.id);

  res.status(StatusCodes.CREATED).json(assignment);
};
