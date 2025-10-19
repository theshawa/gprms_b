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
      payrollBatch: {
        select: {
          id: true,
          month: true,
          year: true,
          status: true,
          processedAt: true,
        },
      },
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

  if (!record) {
    throw new Exception(StatusCodes.NOT_FOUND, "Payslip not found");
  }

  res.json(record);
};
