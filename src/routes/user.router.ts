import "reflect-metadata";
import { Router } from "express";
import { UserController } from "../controllers/user/user.controller";
import { UserService } from "../service/user.service";
import { AppDataSource as dataSource } from "../data-source";
import { User } from "../entities/user";

const userRouter = Router();
const userService = new UserService(dataSource.getRepository(User));
const userController = new UserController(userService);

userRouter.post("/user/create", userController.createUser.bind(userController));
userRouter.get("/user", userController.getAllUser.bind(userController));

export default userRouter;
