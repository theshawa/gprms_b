import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const markRecordAsPaidHandler: RequestHandler<{
  recordId: string;
}> = async (req, res) => {
  const recordId = parseInt(req.params.recordId);

  const record = await prisma.payrollRecord.findUnique({
    where: { id: recordId },
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

  if (!record) {
    throw new Exception(StatusCodes.NOT_FOUND, "Payroll record not found");
  }

  if (record.status !== "Processed") {
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      "Can only mark records as paid after they have been processed (calculated)"
    );
  }

  const updated = await prisma.payrollRecord.update({
    where: { id: recordId },
    data: {
      status: "Paid",
      paidAt: new Date(),
    },
    include: {
      staffMember: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          payrollConfig: true,
        },
      },
      processor: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  res.json(updated);
};
