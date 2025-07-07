import { RequestHandler } from "express";
import { prisma } from "../../../prisma";

export const getStaffMembersHandler: RequestHandler = async (req, res) => {
  const members = await prisma.staffMember.findMany({
    orderBy: {
      role: "asc",
    },
    omit: {
      passwordHash: true,
    },
  });

  res.json(members);
};
