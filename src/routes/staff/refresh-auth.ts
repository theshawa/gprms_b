import { StaffMember } from "@prisma/client";
import { RequestHandler } from "express";
import { prisma } from "../../prisma";
import { createJWTAccessToken, verifyJWTToken } from "../../utils/jwt";

export const staffRefreshAuthHandler: RequestHandler<
  {},
  null | { accessToken: string; user: Omit<StaffMember, "passwordHash"> }
> = async (req, res) => {
  const refreshToken = req.cookies?.["staffRefreshToken"];
  if (!refreshToken) {
    res.json(null);
    return;
  }

  const payload = verifyJWTToken(refreshToken, "refresh");
  if (!payload) {
    res.clearCookie("staffRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json(null);
    return;
  }

  const staffMember = await prisma.staffMember.findUnique({
    where: {
      id: payload.sub,
    },
    omit: {
      passwordHash: true,
    },
  });

  if (!staffMember) {
    res.clearCookie("staffRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json(null);
    return;
  }

  const accessToken = createJWTAccessToken({
    role: payload.role,
    sub: payload.sub,
    username: payload.username,
  });

  res.json({
    accessToken,
    user: staffMember,
  });
};
