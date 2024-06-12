import { User } from "../../entities/user";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../../data-source";
import { UserService } from "../user/user.service";
import { EmailService } from "../email/email.service";
import { EmailTokenPayload } from "../../interfaces/emailTokenPayload";
import { RefreshTokenPayload } from "../../interfaces/refreshTokenPayload";

export class AuthService {
  private userRepository: Repository<User>;
  private userService: UserService;
  private emailService: EmailService;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService(this.userRepository);
    this.emailService = new EmailService();
  }

  private generateToken = (user: User) => {
    const payload = { id: user.id, email: user.email, name: user.name };
    const option = { expiresIn: "1h" };
    return jwt.sign(payload, process.env.JWT_SECRETE as string, option);
  };

  private generateRefreshToken = (user: User) => {
    const payload = { id: user.id, email: user.email, name: user.name };
    const option = { expiresIn: "14d" };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRETE as string, option);
  };

  private generateEmailToken = (user: User) => {
    const payload = { id: user.id, email: user.email, name: user.name };
    const option = { expiresIn: "1d" };
    return jwt.sign(payload, process.env.JWT_EMAIL_SECRETE as string, option);
  };

  public verifyAccessToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRETE as string);
    } catch (error) {
      throw new Error("Invalid token");
    }
  };

  public verifyRefreshToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRETE as string);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  };

  public verifyEmailToken = (token: string): EmailTokenPayload => {
    try {
      const decode = jwt.verify(token, process.env.JWT_EMAIL_SECRETE as string);
      return decode as EmailTokenPayload;
    } catch (error) {
      throw new Error("Invalid email token");
    }
  };

  private hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
  };

  private comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  };

  public register = async (name: string, email: string, password: string) => {
    const passwordHash = await this.hashPassword(password);
    await this.userService.create(name, email, passwordHash);
    const newUser = await this.userService.findOne(email);
    const emailToken = this.generateEmailToken(newUser);
    await this.emailService.sendVerificationEmail(email, emailToken);
  };

  public activeUser = async (id: string) => {
    const user = await this.userService.findOne(id);
    if (!user.is_active) {
      await this.userService.active(id);
    }
  };

  public login = async (email: string, password: string) => {
    const user = await this.userService.findOne(email);
    if (!user.is_active) {
      throw new Error("User is not active, need to active first.");
    }
    const passwordMatch = await this.comparePassword(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid password");
    }
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
    this.userService.addFreshToken(refreshToken, email);
    return { user, accessToken, refreshToken };
  };

  public refreshToken = async (refreshToken: string) => {
    const decode = this.verifyRefreshToken(refreshToken) as RefreshTokenPayload;
    const user = await this.userService.findOne(decode.email);
    if (user.refresh_token !== refreshToken) {
      throw new Error("Invalid refresh token");
    }
    const accessToken = this.generateToken(user);
    return { user, accessToken };
  };
}
