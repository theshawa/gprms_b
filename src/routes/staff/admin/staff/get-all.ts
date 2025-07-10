import { RequestHandler } from "express";
import { prisma } from "../../../../prisma";

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
      assignedDiningAreas: true,
    },
  });

  res.json(members);
};
