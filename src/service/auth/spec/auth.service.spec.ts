import { Repository } from "typeorm";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { EmailService } from "../../email/email.service";
import { User } from "../../../entities/user";
import * as jwt from "jsonwebtoken";
import { mock } from "jest-mock-extended";
import * as bcrypt from "bcryptjs";

const mockUser: User = {
  id: "1",
  email: "",
  password: "",
  name: "John Doe",
  refresh_token: "refreshToken",
  is_active: false,
};

const payload = { id: "id", email: "email", name: "name" };

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => payload),
  sign: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let emailService: jest.Mocked<EmailService>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    userRepository = mock<Repository<User>>();
    userService = mock<UserService>();
    emailService = mock<EmailService>();
    authService = new AuthService();
    (authService as any).userService = userService;
    (authService as any).emailService = emailService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("should verify a accessToken token", () => {
      const token = "accessToken";
      authService.verifyAccessToken(token);
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRETE);
    });

    it("should solve a error when verify accessToken", () => {
      const token = "badToken";
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("fake error");
      });
      expect(() => authService.verifyAccessToken(token)).toThrowError(
        "Invalid token"
      );
    });

    it("should verify a refreshToken token", () => {
      const refreshToken = "refreshToken";
      authService.verifyRefreshToken(refreshToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_REFRESH_SECRETE
      );
    });

    it("should solve a error when verify refreshToken", () => {
      const refreshToken = "badToken";
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("fake error");
      });
      expect(() => authService.verifyRefreshToken(refreshToken)).toThrowError(
        "Invalid refresh token"
      );
    });

    it("should verify an emailToken token", () => {
      const emailToken = "emailToken";
      authService.verifyEmailToken(emailToken);
      expect(jwt.verify).toHaveBeenCalledWith(
        emailToken,
        process.env.JWT_EMAIL_SECRETE
      );
    });

    it("should solve a error when verify emailToken", () => {
      const emailToken = "badToken";
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("fake error");
      });
      expect(() => authService.verifyEmailToken(emailToken)).toThrowError(
        "Invalid email token"
      );
    });
  });

  describe("register", () => {
    it("should register a user", async () => {
      const name = "John Doe";
      const email = "email";
      const password = "password";
      userService.create.mockImplementation(() => Promise.resolve());
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      (bcrypt.hash as jest.Mock).mockImplementation(() =>
        Promise.resolve("password")
      );
      await authService.register(name, email, password);
      expect(userService.create).toHaveBeenCalledWith(
        "John Doe",
        "email",
        "password"
      );
    });
  });

  describe("activeUser", () => {
    it("should active a user", async () => {
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      userService.active.mockImplementation(() => Promise.resolve());
      await authService.activeUser("1");
      expect(userService.active).toHaveBeenCalledWith("1");
    });

    it("should not active a user if already active", async () => {
      userService.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockUser, is_active: true })
      );
      await authService.activeUser("1");
      expect(userService.active).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      mockUser.is_active = true;
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      (bcrypt.compare as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );
      const result = await authService.login("email", "password");
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("user");
      expect(result.user).toEqual(mockUser);
    });

    it("should not login a user if not active", async () => {
      userService.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockUser, is_active: false })
      );
      await expect(authService.login("email", "password")).rejects.toThrowError(
        "User is not active"
      );
    });

    it("should not login a user if password is wrong", async () => {
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      (bcrypt.compare as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      await expect(authService.login("email", "password")).rejects.toThrowError(
        "Invalid password"
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh a token", async () => {
      const refreshToken = "refreshToken";
      const newToken = "newToken";
      mockUser.is_active = true;
      (jwt.verify as jest.Mock).mockImplementationOnce(() => payload);
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      Object.defineProperty(authService, "generateToken", {
        value: jest.fn(() => newToken),
      });
      await authService.refreshToken(refreshToken);
      expect(authService["generateToken"]).toHaveBeenCalled();
    });

    it("should not refresh a token if user has bad refresh token", async () => {
      const refreshToken = "refreshToken";
      mockUser.refresh_token = "badToken";
      (jwt.verify as jest.Mock).mockImplementationOnce(() => payload);
      userService.findOne.mockImplementation(() => Promise.resolve(mockUser));
      await expect(authService.refreshToken(refreshToken)).rejects.toThrowError(
        "Invalid refresh token"
      );
    });
  });
});
