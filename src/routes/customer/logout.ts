import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const customerLogoutHandler: RequestHandler = async (req, res) => {
  res.clearCookie("customerRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.sendStatus(StatusCodes.OK);
};
