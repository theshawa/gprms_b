import { Router } from "express";
import { pingHandler } from "./ping";
import { staffRouter } from "./staff/_router";

export const router = Router();

router.use("/staff", staffRouter);
router.get("/ping", pingHandler);
