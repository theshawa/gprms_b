import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { exceptionHandlerMiddleware } from "./middlewares/exception-handler";
import { router } from "./routes/_router";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(router);

app.use(exceptionHandlerMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`server listening on http://localhost:${PORT}`);
});
