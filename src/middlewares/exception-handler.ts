import { Exception } from "@/lib/exception";
import { ErrorRequestHandler } from "express";

export const exceptionHandlerMiddleware: ErrorRequestHandler = (
  err,
  _,
  res,
  next
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof Exception) {
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  console.error("Unknown error occurred:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
};
