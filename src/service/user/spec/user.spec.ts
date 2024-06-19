import { User } from "../../../entities/user";
import { UserService } from "../user.service";
import { Repository } from "typeorm";
import { mock } from "jest-mock-extended";
import { v4 as uuid } from "uuid";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("UserService", () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    userRepository = mock<Repository<User>>();
    userService = new UserService(userRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMe", () => {
    it("should return a user by id", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: true,
      };

      userRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await userService.getMe("1");
      expect(result).toEqual(mockUser);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const mockUser: User = {
        id: "mock-uuid",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: false,
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);

      await userService.create("Test User", "test@example.com", "password");

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mock-uuid",
          email: "test@example.com",
          password: "password",
          name: "Test User",
        })
      );
    });

    it("should throw an error if email already exists", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: true,
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        userService.create("Test User", "test@example.com", "password")
      ).rejects.toThrow("Email already exists.");
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockUsers: User[] = [
        {
          id: "1",
          email: "test1@example.com",
          password: "password1",
          name: "Test User 1",
          refresh_token: "",
          is_active: true,
        },
        {
          id: "2",
          email: "test2@example.com",
          password: "password2",
          name: "Test User 2",
          refresh_token: "",
          is_active: true,
        },
      ];

      userRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.findAll();
      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a user by email", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: true,
      };

      userRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await userService.findOne("test@example.com");
      expect(result).toEqual(mockUser);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: true,
      };

      userRepository.findOneOrFail.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await userService.update("1", "Updated User", "newpassword");

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          name: "Updated User",
          password: "newpassword",
        })
      );
    });
  });

  describe("addFreshToken", () => {
    it("should add refresh token to a user", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: true,
      };

      userRepository.findOneOrFail.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await userService.addFreshToken("newtoken", "test@example.com");

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          refresh_token: "newtoken",
        })
      );
    });
  });

  describe("active", () => {
    it("should activate a user", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password",
        name: "Test User",
        refresh_token: "",
        is_active: false,
      };

      userRepository.findOneOrFail.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await userService.active("1");

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          is_active: true,
        })
      );
    });
  });
});
