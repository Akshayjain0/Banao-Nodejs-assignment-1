import express, { urlencoded } from "express";
import { authRouter } from "./routes/authRoutes.js";
import { postRouter } from "./routes/postRoutes.js";

import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", authRouter);
app.use("/api/v1", postRouter);

export {app}