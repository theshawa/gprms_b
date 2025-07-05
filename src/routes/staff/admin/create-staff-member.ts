import { StaffMember, StaffRole } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { Exception } from "../../../lib/exception";
import { prisma } from "../../../prisma";
import { hashPassword } from "../../../utils/password";

export const createStaffMemberHandlerBodySchema = z.object({
  name: z.string().nonempty("name is required").trim(),
  username: z.string().nonempty("username is required").trim(),
  password: z
    .string()
    .nonempty("password is required")
    .min(6, "password must be at least 6 characters long")
    .trim(),
  role: z.enum(["KitchenManager", "Cashier", "Waiter"]),
});

export const createStaffMemberHandler: RequestHandler<
  {},
  Omit<StaffMember, "passwordHash">
> = async (req, res) => {
  const currentStaffMember = await prisma.staffMember.findFirst({
    where: {
      username: req.body.username,
    },
  });

  if (currentStaffMember) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "user with this username already exists"
    );
  }

  const passwordHash = await hashPassword("123456");

  const staffMember = await prisma.staffMember.create({
    data: {
      name: req.body.name,
      passwordHash,
      role: req.body.role as StaffRole,
      username: req.body.username,
    },
    omit: {
      passwordHash: true,
    },
  });

  res.status(StatusCodes.CREATED).json(staffMember);
};
