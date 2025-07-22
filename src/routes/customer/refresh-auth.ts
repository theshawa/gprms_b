import { prisma } from "@/prisma";
import { createJWTAccessToken, verifyJWTToken } from "@/utils/jwt";
import { Customer } from "@prisma/client";
import { RequestHandler } from "express";

export const customerRefreshAuthHandler: RequestHandler<
  {},
  null | { accessToken: string; user: Customer }
> = async (req, res) => {
  const refreshToken = req.cookies?.["customerRefreshToken"];
  if (!refreshToken) {
    res.json(null);
    return;
  }

  const payload = verifyJWTToken(refreshToken, "refresh");
  if (!payload) {
    res.clearCookie("customerRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json(null);
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!customer) {
    res.clearCookie("customerRefreshToken", {
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
    user: customer,
  });
};
