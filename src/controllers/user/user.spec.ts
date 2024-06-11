import { Request, Response } from "express";
import { createUser } from "./user.controller";
import { User } from "../../entities/user";
import { mock, mockReset } from "jest-mock-extended";
import { Repository, QueryFailedError } from "typeorm";
import { v4 as uuid } from "uuid";

jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("1234-5678-91011"),
}));

jest.mock("../../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import { AppDataSource as dataSource } from "../../data-source";

const mockUserRepository = mock<Repository<User>>();
(dataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

describe("createUser", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();
    req = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      },
    };
    res = {
      status: statusMock,
      send: sendMock,
    };
  });

  it("should create a new user", async () => {
    await createUser(req as Request, res as Response);
    expect(uuid).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1234-5678-91011",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
      })
    );
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith("A new user created!");
  });

  it("should handle error when creating a user", async () => {
    mockUserRepository.save.mockRejectedValue(new Error("Error saving user"));
    await createUser(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({ message: "Error creating user." });
  });

  it("should handle QueryFailedError when creating a user", async () => {
    const error = new QueryFailedError("Query failed", [], "error--" as any);
    mockUserRepository.save.mockRejectedValueOnce(error);

    await createUser(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Error creating user.",
      error: "error--",
    });
  });
});
