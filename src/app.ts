import dotenv from "dotenv";
import express, { Application } from "express";
import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";

dotenv.config();

const app: Application = express();
app.use(express.json());

app.use("/api/v1", userRouter);
app.use("/api/v1", authRouter);

export default app;
