import { Router } from "express";
import { customerRouter } from "./customer/_router";
import { pingHandler } from "./ping";
import { staffRouter } from "./staff/_router";
import { testRouter } from "./test/_router";

export const router = Router();

router.use("/staff", staffRouter);
router.use("/customer", customerRouter);
router.get("/ping", pingHandler);
router.use("/test", testRouter);
