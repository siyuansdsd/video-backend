import "reflect-metadata";
import { Router } from "express";
import { UserController } from "../controllers/user/user.controller";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/user/create", userController.createUser);
userRouter.get("/user", userController.getAllUser);

export default userRouter;
