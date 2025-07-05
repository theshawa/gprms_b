import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const staffLogoutHandler: RequestHandler = async (req, res) => {
  res.clearCookie("staffRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.sendStatus(StatusCodes.OK);
};
