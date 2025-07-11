import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { createJWTAccessToken, createJWTRefreshToken } from "@/utils/jwt";
import { verifyPassword } from "@/utils/password";
import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const staffLoginHandlerBodySchema = z.object({
  username: z.string().nonempty("required").trim(),
  password: z.string().nonempty("required").trim(),
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
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "User with given username not found"
    );
  }

  const isPasswordValid = await verifyPassword(
    password,
    staffMember.passwordHash
  );
  if (!isPasswordValid) {
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid password");
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
