import { prisma } from "@/prisma";
import { StaffMember, StaffPayrollConfig } from "@prisma/client";
import { RequestHandler } from "express";

export const getMyPayrollConfigHandler: RequestHandler<
  {},
  StaffPayrollConfig | null,
  {},
  {},
  { user: StaffMember }
> = async (_, res) => {
  const staffId = res.locals.user.id;

  const config = await prisma.staffPayrollConfig.findUnique({
    where: { staffMemberId: staffId },
    include: {
      staffMember: true,
    },
  });

  res.json(config);
};
