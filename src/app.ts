import dotenv from "dotenv";
import express, { Application } from "express";
import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";
import videoRouter from "./routes/video.router";

dotenv.config();

const app: Application = express();
app.use(express.json());

app.use("/api/v1", userRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", videoRouter);

export default app;
