import { Exception } from "@/lib/exception";
import { prisma } from "@/prisma";
import { deleteFromCache, getFromCache } from "@/redis/storage";
import { createJWTAccessToken, createJWTRefreshToken } from "@/utils/jwt";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

export const verifyLoginCodeBodySchema = z.object({
  phoneNumber: z.string().trim().nonempty("Phone number is required"),
  code: z.string().trim().length(6, "Code must be 6 digits"),
});

export const verifyLoginCodeHandler: RequestHandler = async (req, res) => {
  const { phoneNumber, code } = verifyLoginCodeBodySchema.parse(req.body);

  const cache = await getFromCache<{ code: string; name: string }>(
    `customer-login:${phoneNumber}`
  );
  if (!cache) {
    throw new Exception(
      StatusCodes.NOT_FOUND,
      "Verification code not found or expired"
    );
  }

  if (cache.code !== code) {
    throw new Exception(StatusCodes.UNAUTHORIZED, "Invalid verification code");
  }

  await deleteFromCache(`customer-login:${phoneNumber}`);

  let customer = await prisma.customer.findFirst({
    where: { phoneNumber },
  });

  let customerFound = !!customer;

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phoneNumber,
        name: cache.name,
      },
    });
  }

  const payload = {
    sub: customer.id,
    phoneNumber: customer.phoneNumber,
    role: "customer",
  };

  const refreshToken = createJWTRefreshToken(payload);

  res.cookie("customerRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  const accessToken = createJWTAccessToken({
    phoneNumber: customer.phoneNumber,
    name: customer.name,
    id: customer.id,
  });

  res.json({
    accessToken,
    user: customer,
    customerFound,
  });
};
