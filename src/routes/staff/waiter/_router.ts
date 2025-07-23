import { Router } from "express";
import { acceptTableHandler } from "./accept-table";

export const waiterRouter = Router();

waiterRouter.post("/accept-table/:tableId", acceptTableHandler);
