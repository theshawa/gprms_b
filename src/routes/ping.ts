import { RequestHandler } from "express";

export const pingHandler: RequestHandler = async (req, res) => {
  res.json("pong");
};
