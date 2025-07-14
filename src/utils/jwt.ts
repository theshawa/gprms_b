import { Config } from "@/config";
import { AuthPayload } from "@/lib/auth-payload";
import jwt from "jsonwebtoken";

export const createJWTAccessToken = (data: AuthPayload): string => {
  return jwt.sign(data, Config.ACCESS_TOKEN_SECRET, {
    expiresIn: Config.ACCESS_TOKEN_EXPIRY as any,
  });
};

export const createJWTRefreshToken = (data: AuthPayload): string => {
  return jwt.sign(data, Config.REFRESH_TOKEN_SECRET, {
    expiresIn: Config.REFRESH_TOKEN_EXPIRY as any,
  });
};

export const verifyJWTToken = (
  token: string,
  type: "access" | "refresh" = "access"
): AuthPayload | null => {
  try {
    return jwt.verify(
      token,
      type === "refresh"
        ? Config.REFRESH_TOKEN_SECRET
        : Config.ACCESS_TOKEN_SECRET
    ) as unknown as AuthPayload;
  } catch (error) {
    return null;
  }
};
