import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { Exception } from "../../lib/exception";
import { prisma } from "../../prisma";
import { createJWTAccessToken, createJWTRefreshToken } from "../../utils/jwt";
import { verifyPassword } from "../../utils/password";

export const staffLoginHandlerBodySchema = z.object({
  username: z.string().nonempty("username is required").trim(),
  password: z
    .string()
    .nonempty("password is required")
    .min(6, "password must be at least 6 characters long")
    .trim(),
});

export const staffLoginHandler: RequestHandler<
  {},
  { accessToken: string; user: Omit<StaffMember, "passwordHash"> },
  z.infer<typeof staffLoginHandlerBodySchema>
> = async (req, res) => {
  const { username, password } = req.body;

  const staffMember = await prisma.staffMember.findFirst({
    where: {
      username,
    },
  });

  if (!staffMember) {
    throw new Exception(StatusCodes.NOT_FOUND, "staff member not found");
  }

  const isPasswordValid = await verifyPassword(
    password,
    staffMember.passwordHash
  );
  if (!isPasswordValid) {
    throw new Exception(StatusCodes.UNAUTHORIZED, "invalid password");
  }

  // create activity log
  await prisma.staffActivityLog.create({
    data: {
      activity: `Successfully logged in with IP address ${req.ip}`,
      staffMemberId: staffMember.id,
    },
  });

  const payload = {
    sub: staffMember.id,
    username: staffMember.username,
    role: staffMember.role,
  };

  const refreshToken = createJWTRefreshToken(payload);

  res.cookie("staffRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
  });

  const accessToken = createJWTAccessToken(payload);

  // Omit passwordHash from the response
  const { passwordHash, ...staffMemberWithoutPassword } = staffMember;

  res.json({
    accessToken,
    user: staffMemberWithoutPassword,
  });
};
