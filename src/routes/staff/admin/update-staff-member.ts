import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { Exception } from "../../../lib/exception";
import { prisma } from "../../../prisma";
import { hashPassword } from "../../../utils/password";

export const updateStaffMemberHandlerBodySchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  username: z.string().trim().nonempty("Username is required"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long")
    .optional()
    .or(z.literal("")),
});

export const updateStaffMemberHandler: RequestHandler<
  { id: string },
  Omit<StaffMember, "passwordHash">,
  z.infer<typeof updateStaffMemberHandlerBodySchema>
> = async (req, res) => {
  const currentStaffMember = await prisma.staffMember.findFirst({
    where: {
      username: req.body.username,
      id: {
        not: parseInt(req.params.id),
      },
    },
  });

  if (currentStaffMember) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "Another user with this username already exists"
    );
  }

  const passwordHash = req.body.password
    ? await hashPassword(req.body.password)
    : undefined;

  const staffMember = await prisma.staffMember.update({
    data: {
      name: req.body.name,
      username: req.body.username,
      passwordHash,
    },
    where: {
      id: parseInt(req.params.id),
    },
    omit: {
      passwordHash: true,
    },
  });

  res.status(StatusCodes.OK).json(staffMember);
};
