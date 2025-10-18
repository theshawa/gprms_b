import { prisma } from "@/prisma";
import { StaffRole } from "@prisma/client";
import { RequestHandler } from "express";

export const getAllStaffConfigsHandler: RequestHandler = async (_, res) => {
  // Get all staff members except Admin
  const allStaff = await prisma.staffMember.findMany({
    where: {
      role: {
        not: StaffRole.Admin,
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });

  // Get existing configs
  const existingConfigs = await prisma.staffPayrollConfig.findMany({
    select: {
      staffMemberId: true,
    },
  });

  const existingConfigStaffIds = new Set(
    existingConfigs.map((c) => c.staffMemberId)
  );

  // Create default configs for staff members who don't have one
  const staffWithoutConfigs = allStaff.filter(
    (staff) => !existingConfigStaffIds.has(staff.id)
  );

  if (staffWithoutConfigs.length > 0) {
    await prisma.staffPayrollConfig.createMany({
      data: staffWithoutConfigs.map((staff) => ({
        staffMemberId: staff.id,
        basicSalary: 0,
        transportAllowance: 0,
        mealAllowance: 0,
        otherAllowance: 0,
        taxPercentage: 0,
        epfPercentage: 8,
      })),
    });
  }

  // Fetch all configs with staff member details
  const configs = await prisma.staffPayrollConfig.findMany({
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
    orderBy: {
      staffMember: {
        name: "asc",
      },
    },
  });

  res.json(configs);
};
