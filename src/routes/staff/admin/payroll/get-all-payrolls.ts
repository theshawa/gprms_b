import { prisma } from "@/prisma";
import { RequestHandler } from "express";

export const getAllPayrollsHandler: RequestHandler = async (_, res) => {
  // Get all staff members with their latest payroll records and payroll configs
  const staffMembers = await prisma.staffMember.findMany({
    where: {
      role: {
        not: "Admin",
      },
    },
    include: {
      payrollConfig: true, // Include payroll configuration
      payrollRecords: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 3, // Show last 3 months
        include: {
          staffMember: {
            include: {
              payrollConfig: true, // Include config in records too for calculate dialog
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
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  res.json(staffMembers);
};
