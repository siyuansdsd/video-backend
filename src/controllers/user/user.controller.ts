import e, { Request, Response } from "express";
import { UserService } from "../../service/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  public async createUser(req: Request, res: Response) {
    const { name, email, password } = req.body;
    try {
      await this.userService.create(name, email, password);
      res.status(201).send("A new user created!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating user.";
      res.status(500).send(errorMessage);
    }
  }

  public async getAllUser(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();
      res.status(200).send(users);
    } catch (error) {
      res.status(500).send({ message: "Error fetching users." });
    }
  }
}
