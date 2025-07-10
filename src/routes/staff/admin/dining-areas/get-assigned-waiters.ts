import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../../../prisma";

export const getAssignedWaitersHandler: RequestHandler<
  {
    diningTableId: string;
  },
  StaffMember[]
> = async (req, res) => {
  const assignments = await prisma.waiterAssignment.findMany({
    where: {
      diningAreaId: parseInt(req.params.diningTableId),
    },
    include: {
      waiter: {
        include: {
          assignedDiningAreas: true,
        },
      },
    },
  });

  res.json(assignments.map((a) => a.waiter));
};
