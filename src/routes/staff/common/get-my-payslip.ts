import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const getMyPayslipHandler: RequestHandler<
  { recordId: string },
  {},
  {},
  {},
  { user: StaffMember }
> = async (req, res) => {
  const recordId = parseInt(req.params.recordId);
  const staffId = res.locals.user.id;

  const record = await prisma.payrollRecord.findFirst({
    where: {
      id: recordId,
      staffMemberId: staffId,
    },
    include: {
      processor: true,
      staffMember: true,
    },
  });

  if (!record) {
    throw new Exception(StatusCodes.NOT_FOUND, "Payslip not found");
  }

  res.json(record);
};
