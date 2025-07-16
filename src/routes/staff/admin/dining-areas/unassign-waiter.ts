import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { publishEvent } from "@/redis/events/publisher";
import { StaffRole, WaiterAssignment } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const unAssignWaiterHandlerBodySchema = z.object({
  waiterId: z.number().int().positive("Waiter Id must be a positive integer"),
  diningAreaId: z
    .number()
    .int()
    .positive("Dining Area Id must be a positive integer"),
});

export const unAssignWaiterHandler: RequestHandler<
  {},
  WaiterAssignment,
  z.infer<typeof unAssignWaiterHandlerBodySchema>
> = async (req, res) => {
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

  const currentAssignment = await prisma.waiterAssignment.findFirst({
    where: req.body,
  });

  if (!currentAssignment) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "This waiter is not assigned to this dining table"
    );
  }

  const assignment = await prisma.waiterAssignment.delete({
    where: {
      id: currentAssignment.id,
    },
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

  await publishEvent("waiter-unassigned", waiter.id);

  res.status(StatusCodes.OK).json(assignment);
};
