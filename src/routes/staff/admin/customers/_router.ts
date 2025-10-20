import { Router } from "express";
import { getAllCustomersHandler } from "./get-all";

export const customersRouter = Router();

customersRouter.get("/", getAllCustomersHandler);
