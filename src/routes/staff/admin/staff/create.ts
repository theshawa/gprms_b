import { StaffMember, StaffRole } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { Exception } from "../../../../lib/exception";
import { prisma } from "../../../../prisma";
import { hashPassword } from "../../../../utils/password";

export const createStaffMemberHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  username: z.string().trim().nonempty("Username is required"),
  password: z
    .string()
    .trim()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["KitchenManager", "Cashier", "Waiter"]),
});

export const createStaffMemberHandler: RequestHandler<
  {},
  Omit<StaffMember, "passwordHash">,
  z.infer<typeof createStaffMemberHandlerBodySchema>
> = async (req, res) => {
  const currentStaffMember = await prisma.staffMember.findFirst({
    where: {
      username: req.body.username.toLowerCase().trim(),
    },
  });

  if (currentStaffMember) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "User with this username already exists"
    );
  }

  const passwordHash = await hashPassword(req.body.password);

  const staffMember = await prisma.staffMember.create({
    data: {
      role: req.body.role as StaffRole,
      name: req.body.name.trim(),
      username: req.body.username.toLowerCase().trim(),
      passwordHash,
    },
    omit: {
      passwordHash: true,
    },
  });

  res.status(StatusCodes.CREATED).json(staffMember);
};
