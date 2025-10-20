import { prisma } from "@/prisma";
import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";

export const getMyPayrollHistoryHandler: RequestHandler<
  {},
  {},
  {},
  {},
  { user: StaffMember }
> = async (_, res) => {
  const staffId = res.locals.user.id;

  const records = await prisma.payrollRecord.findMany({
    where: {
      staffMemberId: staffId,
      status: "Paid", // Only show paid records to staff
    },
    include: {
      staffMember: true,
      processor: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  res.json(records);
};
