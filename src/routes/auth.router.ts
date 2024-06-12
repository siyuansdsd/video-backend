import { Router } from "express";
import { authController } from "../controllers/auth/auth.controller";

const authRouter = Router();
const auth = new authController();

authRouter.post("/auth/register", auth.register);
authRouter.post("/auth/login", auth.login);
authRouter.post("/auth/refresh", auth.refreshToken);

authRouter.get("/auth/email/:token", auth.verifyEmail);

export default authRouter;
