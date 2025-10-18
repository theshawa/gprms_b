import { prisma } from "@/prisma";
import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";

export const getMyPayrollConfigHandler: RequestHandler<
  {},
  {},
  {},
  {},
  { user: StaffMember }
> = async (_, res) => {
  const staffId = res.locals.user.id;

  const config = await prisma.staffPayrollConfig.findUnique({
    where: { staffMemberId: staffId },
    include: {
      staffMember: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
      },
    },
  });

  res.json(config);
};
