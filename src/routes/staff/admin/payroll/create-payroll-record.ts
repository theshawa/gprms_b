import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const createPayrollRecordBodySchema = z.object({
  staffMemberId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const createPayrollRecordHandler: RequestHandler<
  {},
  {},
  z.infer<typeof createPayrollRecordBodySchema>,
  {},
  { user: StaffMember }
> = async (req, res) => {
  const { staffMemberId, month, year } = req.body;

  // Check if record already exists
  const existing = await prisma.payrollRecord.findUnique({
    where: {
      staffMemberId_month_year: {
        staffMemberId: staffMemberId,
        month,
        year,
      },
    },
  });

  if (existing) {
    throw new Exception(
      StatusCodes.CONFLICT,
      `Payroll record for this staff member and period already exists`
    );
  }

  // Get staff config
  const config = await prisma.staffPayrollConfig.findUnique({
    where: { staffMemberId: staffMemberId },
  });

  if (!config) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Staff payroll configuration not found"
    );
  }

  // Create record with config values
  const record = await prisma.payrollRecord.create({
    data: {
      staffMemberId: staffMemberId,
      month,
      year,
      basicSalary: config.basicSalary,
      transportAllowance: config.transportAllowance,
      mealAllowance: config.mealAllowance,
      otherAllowance: config.otherAllowance,
    },
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

  res.status(StatusCodes.CREATED).json(record);
};
