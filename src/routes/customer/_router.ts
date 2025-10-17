import { bodyValidatorMiddleware } from "@/middlewares/body-validator";
import { Router } from "express";
import { loginHandler, loginHandlerBodySchema } from "./login";
import { customerLogoutHandler } from "./logout";
import { customerRefreshAuthHandler } from "./refresh-auth";
import { takeawayRouter } from "./takeaway/_router";
import {
  verifyLoginCodeBodySchema,
  verifyLoginCodeHandler,
} from "./verify-login-code";
import { menuRouter } from "./menu/_router";

export const customerRouter = Router();

customerRouter.post(
  "/login",
  bodyValidatorMiddleware(loginHandlerBodySchema),
  loginHandler
);

customerRouter.post(
  "/verify-login-code",
  bodyValidatorMiddleware(verifyLoginCodeBodySchema),
  verifyLoginCodeHandler
);

customerRouter.post("/refresh-auth", customerRefreshAuthHandler);

customerRouter.post("/logout", customerLogoutHandler);

customerRouter.use("/takeaway", takeawayRouter);

customerRouter.use("/menu", menuRouter);
