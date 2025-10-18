import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const updatePayrollRecordBodySchema = z.object({
  bonusAmount: z.number().min(0, "Bonus must be positive").optional(),
  notes: z.string().optional(),
});

export const updatePayrollRecordHandler: RequestHandler<
  { recordId: string },
  {},
  z.infer<typeof updatePayrollRecordBodySchema>
> = async (req, res) => {
  const recordId = parseInt(req.params.recordId);
  const data = req.body;

  const record = await prisma.payrollRecord.findUnique({
    where: { id: recordId },
    include: {
      staffMember: {
        include: {
          payrollConfig: true,
        },
      },
    },
  });

  if (!record) {
    throw new Exception(StatusCodes.NOT_FOUND, "Payroll record not found");
  }

  if (record.status === "Paid") {
    throw new Exception(StatusCodes.BAD_REQUEST, "Cannot update paid records");
  }

  // Get staff payroll config for tax and EPF percentages
  const config = await prisma.staffPayrollConfig.findUnique({
    where: { staffMemberId: record.staffMemberId },
  });

  if (!config) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Staff payroll configuration not found"
    );
  }

  // Calculate payroll
  const bonusAmount = data.bonusAmount ?? record.bonusAmount;
  const grossPay =
    record.basicSalary +
    record.transportAllowance +
    record.mealAllowance +
    record.otherAllowance +
    bonusAmount;

  const taxAmount = (grossPay * config.taxPercentage) / 100;
  const epfAmount = (grossPay * config.epfPercentage) / 100;
  const totalDeductions = taxAmount + epfAmount;
  const netPay = grossPay - totalDeductions;

  const updated = await prisma.payrollRecord.update({
    where: { id: recordId },
    data: {
      bonusAmount,
      notes: data.notes,
      grossPay,
      taxAmount,
      epfAmount,
      totalDeductions,
      netPay,
      status: "Processed", // Auto-process after calculation
      processedBy: res.locals.user.id, // Track who processed
      processedAt: new Date(), // Track when processed
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
