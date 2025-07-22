import { Router } from "express";
import { getDiningTableHandler } from "./get-dining-table";

export const dineinRouter = Router();

dineinRouter.get("/:tableId/:time", getDiningTableHandler);
