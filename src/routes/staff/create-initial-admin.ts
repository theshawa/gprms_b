import { Config } from "@/config";
import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { hashPassword } from "@/utils/password";
import { StaffMember, StaffRole } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const createInitialAdminHandler: RequestHandler<
  {},
  Omit<StaffMember, "passwordHash">,
  {},
  { password: string }
> = async (req, res) => {
  const givenPassword = req.query.password as string;

  if (givenPassword !== Config.INITIAL_ADMIN_PASSWORD()) {
    throw new Exception(StatusCodes.UNAUTHORIZED, "invalid password");
  }

  const currentAdmin = await prisma.staffMember.findFirst({
    where: {
      role: StaffRole.Admin,
    },
  });

  if (currentAdmin) {
    throw new Exception(StatusCodes.CONFLICT, "admin already exists.");
  }

  const passwordHash = await hashPassword("123456");

  const admin = await prisma.staffMember.create({
    data: {
      name: "Initial Admin",
      passwordHash,
      role: StaffRole.Admin,
      username: "admin",
    },
    omit: {
      passwordHash: true,
    },
  });

  res.status(StatusCodes.CREATED).json(admin);
};
