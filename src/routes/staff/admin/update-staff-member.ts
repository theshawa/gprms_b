import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { Exception } from "../../../lib/exception";
import { prisma } from "../../../prisma";
import { hashPassword } from "../../../utils/password";

export const updateStaffMemberHandlerBodySchema = z.object({
  name: z.string().nonempty("name is required").trim(),
  username: z.string().nonempty("username is required").trim(),
  password: z
    .string()
    .nonempty("password is required")
    .min(6, "password must be at least 6 characters long")
    .trim(),
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
        not: res.locals.user.id,
      },
    },
  });

  if (currentStaffMember) {
    throw new Exception(
      StatusCodes.CONFLICT,
      "another user with this username already exists"
    );
  }

  const passwordHash = await hashPassword("123456");

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
