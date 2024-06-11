import express, { Application } from "express";
import userRouter from "./routes/user.router";

const app: Application = express();
app.use(express.json());

app.use("/api/v1", userRouter);

export default app;
