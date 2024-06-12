import { Repository } from "typeorm";
import { UserService } from "../user.service";
import { User } from "../../../entities/user";
import { mock } from "jest-mock-extended";

// 创建一个 mock 的 User 实例
const mockUser: User = {
  id: "1",
  email: "john@example.com",
  password: "password123",
  name: "John Doe",
  video_id: [],
  refresh_token: "",
  is_active: false,
};

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

  describe("create", () => {
    it("should create a new user", async () => {
      userRepository.save.mockResolvedValue(mockUser);

      const name = "John Doe";
      const email = "john@example.com";
      const password = "password123";

      await userService.create(name, email, password);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          email,
          password,
        })
      );
    });

    it("should throw an error if email already exists", async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      const name = "John Doe";
      const email = "john@example.com";
      const password = "password123";

      await expect(
        userService.create(name, email, password)
      ).rejects.toThrowError("Email already exists.");
    });

    describe("findAll", () => {
      it("should return all users", async () => {
        userRepository.find.mockResolvedValue([mockUser]);

        const users = await userService.findAll();

        expect(users).toEqual([mockUser]);
      });
    });

    describe("findOne", () => {
      it("should return a user by id", async () => {
        userRepository.findOneOrFail.mockResolvedValue(mockUser);

        const id = "1";
        const user = await userService.findOne(id);

        expect(user).toEqual(mockUser);
      });
    });
  });
});
