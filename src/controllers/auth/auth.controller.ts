import { AuthService } from "../../service/auth/auth.service";
import { UserService } from "../../service/user/user.service";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/user";
import { Request, Response } from "express";

export class authController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService(AppDataSource.getRepository(User));
  }

  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
      await this.authService.register(name, email, password);
      res.status(200).send({ message: "A new user created!" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating user.";
      res.status(500).send({ message: errorMessage });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const loginMessage = await this.authService.login(email, password);
      res.status(200).send({ message: loginMessage });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error logging in.";
      res.status(500).send({ message: errorMessage });
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;
    try {
      const decode = this.authService.verifyEmailToken(token);
      res.status(200).send({ message: "Email verified!" });
      this.userService.active(decode.id);
    } catch (error) {
      res.status(500).send({ message: "Error verifying email." });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
      const result = await this.authService.refreshToken(token);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ message: "Error refreshing token." });
    }
  };
}
