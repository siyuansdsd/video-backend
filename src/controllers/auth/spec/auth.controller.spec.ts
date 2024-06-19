import { AuthService } from "../../../service/auth/auth.service";
import { UserService } from "../../../service/user/user.service";
import { User } from "../../../entities/user";
import { authController } from "../auth.controller";
import { Request, Response } from "express";
import { mock } from "jest-mock-extended";

describe("authController", () => {
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let controller: authController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    authService = mock<AuthService>();
    userService = mock<UserService>();
    controller = new authController();
    (controller as any).authService = authService;
    (controller as any).userService = userService;
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return a success message", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password",
      };
      authService.register.mockResolvedValueOnce();

      await controller.register(req as Request, res as Response);

      expect(authService.register).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "password"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: "A new user created!" });
    });

    it("should return an error message if registration fails", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password",
      };
      authService.register.mockRejectedValueOnce(
        new Error("Registration error")
      );

      await controller.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: "Registration error" });
    });

    it("should return an error message if catch unknown", async () => {
      req.body = { name: "John Doe", email: "email", password: "password" };
      authService.register.mockRejectedValueOnce({});
      await controller.register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error creating user.",
      });
    });
  });

  describe("login", () => {
    it("should log in a user and return a success message", async () => {
      req.body = { email: "john@example.com", password: "password" };
      authService.login.mockResolvedValueOnce({
        user: {} as User,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      });

      await controller.login(req as Request, res as Response);

      expect(authService.login).toHaveBeenCalledWith(
        "john@example.com",
        "password"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: {
          user: {},
          accessToken: "accessToken",
          refreshToken: "refreshToken",
        },
      });
    });

    it("should return an error message if login fails", async () => {
      req.body = { email: "john@example.com", password: "password" };
      authService.login.mockRejectedValueOnce(new Error("Login error"));

      await controller.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: "Login error" });
    });

    it("should return an error message if catch unknown", async () => {
      req.body = { email: "", password: "" };
      authService.login.mockRejectedValueOnce({});
      await controller.login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error logging in.",
      });
    });
  });

  describe("verifyEmail", () => {
    it("should verify email and return a success message", async () => {
      req.params = { token: "valid-token" };
      authService.verifyEmailToken.mockReturnValueOnce({
        id: "user-id",
        email: "test@example.com",
        name: "Test User",
        iat: 0,
        exp: 0,
      });

      await controller.verifyEmail(req as Request, res as Response);

      expect(authService.verifyEmailToken).toHaveBeenCalledWith("valid-token");
      expect(userService.active).toHaveBeenCalledWith("user-id");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: "Email verified!" });
    });

    it("should return an error message if email verification fails", async () => {
      req.params = { token: "invalid-token" };
      authService.verifyEmailToken.mockImplementationOnce(() => {
        throw new Error("Verification error");
      });

      await controller.verifyEmail(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error verifying email.",
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token and return the result", async () => {
      req.body = { token: "valid-token" };
      const user: User = {
        id: "user-id",
        email: "",
        name: "",
        password: "",
        refresh_token: "",
      } as User;
      const mockResult = { accessToken: "new-access-token", user };
      authService.refreshToken.mockResolvedValueOnce(mockResult);

      await controller.refreshToken(req as Request, res as Response);

      expect(authService.refreshToken).toHaveBeenCalledWith("valid-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("should return an error message if refreshing token fails", async () => {
      req.body = { token: "invalid-token" };
      authService.refreshToken.mockRejectedValueOnce(
        new Error("Refresh error")
      );

      await controller.refreshToken(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error refreshing token.",
      });
    });
  });
});
