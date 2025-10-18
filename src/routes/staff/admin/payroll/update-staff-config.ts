import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const updateStaffConfigBodySchema = z.object({
  basicSalary: z.number().min(0, "Basic salary must be positive"),
  transportAllowance: z.number().min(0, "Transport allowance must be positive"),
  mealAllowance: z.number().min(0, "Meal allowance must be positive"),
  otherAllowance: z.number().min(0, "Other allowance must be positive"),
  taxPercentage: z.number().min(0).max(100, "Tax must be between 0-100%"),
  epfPercentage: z.number().min(0).max(100, "EPF must be between 0-100%"),
});

export const updateStaffConfigHandler: RequestHandler<
  { staffId: string },
  {},
  z.infer<typeof updateStaffConfigBodySchema>
> = async (req, res) => {
  const staffId = parseInt(req.params.staffId);
  const data = req.body;

  // Check if staff exists
  const staff = await prisma.staffMember.findUnique({
    where: { id: staffId },
  });

  if (!staff) {
    throw new Exception(StatusCodes.NOT_FOUND, "Staff member not found");
  }

  // Don't allow payroll config for Admin role
  if (staff.role === "Admin") {
    throw new Exception(
      StatusCodes.BAD_REQUEST,
      "Cannot create payroll config for Admin role"
    );
  }

  // Upsert (create or update)
  const config = await prisma.staffPayrollConfig.upsert({
    where: { staffMemberId: staffId },
    create: {
      staffMemberId: staffId,
      ...data,
    },
    update: data,
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
