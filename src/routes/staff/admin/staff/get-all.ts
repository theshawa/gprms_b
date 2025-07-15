import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getAllStaffMembersHandler: RequestHandler<
  {},
  {},
  {},
  { role?: string }
> = async (req, res) => {
  const whereClause: any = {};
  if (req.query.role) {
    whereClause.role = req.query.role;
  }

  const members = await prisma.staffMember.findMany({
    orderBy: {
      role: "asc",
    },
    omit: {
      passwordHash: true,
    },
    where: whereClause,
    include: {
      assignedDiningAreas: {
        include: {
          diningArea: true,
        },
      },
    },
  });

  res.json(members);
};
