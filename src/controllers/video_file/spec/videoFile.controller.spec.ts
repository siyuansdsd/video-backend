import { VideoFileService } from "../../../service/video_file/videoFile.service";
import { AuthService } from "../../../service/auth/auth.service";
import { AwsService } from "../../../service/aws/aws.service";
import { VideoFileController } from "../videoFile.controller";
import { AccessTokenPayload } from "../../../interfaces/accessTokenPayload";
import { Request, Response } from "express";
import { mock } from "jest-mock-extended";
import { emitWarning } from "process";

describe("VideoFileController", () => {
  let videoFileService: jest.Mocked<VideoFileService>;
  let authService: jest.Mocked<AuthService>;
  let awsService: jest.Mocked<AwsService>;
  let controller: VideoFileController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    videoFileService = mock<VideoFileService>();
    authService = mock<AuthService>();
    awsService = mock<AwsService>();
    controller = new VideoFileController(videoFileService, authService);
    (controller as any).awsService = awsService;

    req = {
      headers: {
        authorization: "",
      },
      body: {},
      file: {
        fieldname: "file",
        originalname: "file.mp4",
        encoding: "utf-8",
        mimetype: "text/plain",
        buffer: Buffer.from("file content"),
        size: 100,
        stream: null,
        destination: "",
        filename: "",
        path: "",
      } as unknown as Express.Multer.File,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createVideoFile", () => {
    it("should create a new video file and return a success message", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.isSizeValid.mockReturnValue(true);
      videoFileService.isVideoFile.mockReturnValue(true);
      videoFileService.create.mockResolvedValue({ id: "video1" } as any);
      awsService.uploadFile.mockResolvedValue("url");

      await controller.createVideoFile(req as Request, res as Response);

      expect(authService.verifyAccessToken).toHaveBeenCalledWith(
        "Bearer token"
      );
      expect(videoFileService.isSizeValid).toHaveBeenCalledWith(100);
      expect(videoFileService.isVideoFile).toHaveBeenCalledWith(req.file);
      expect(videoFileService.create).toHaveBeenCalledWith(
        "Test Video",
        "Test Description",
        "user1",
        100
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "A new video file created!",
      });
    });

    it("should return an error if required fields are missing", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = { title: "Test Video" };

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Missing required fields",
      });
    });

    it("should return an error if authorization header is missing", async () => {
      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Authorization header is required");
    });

    it("should return error if id in token does not match user_ids", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };
      authService.verifyAccessToken.mockReturnValue({
        id: "user2",
      } as AccessTokenPayload);

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("should return error if file size is too large", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };
      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.isSizeValid.mockReturnValue(false);

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "file size is too large, the biggest file size is 100MB.",
      });
    });

    it("should return error if file format is invalid", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };
      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.isSizeValid.mockReturnValue(true);
      videoFileService.isVideoFile.mockReturnValue(false);

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Invalid file format" });
    });

    it("should call video service if file format is not mp4", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };
      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as unknown as AccessTokenPayload);
      videoFileService.isSizeValid.mockReturnValue(true);
      videoFileService.isVideoFile.mockReturnValue(true);
      videoFileService.isMp4File.mockReturnValue(false);

      await controller.createVideoFile(req as Request, res as Response);

      expect(videoFileService.isMp4File).toHaveBeenCalledWith(req.file);
      expect(videoFileService.convertFileToMP4).toHaveBeenCalledWith(
        req.file,
        "mp4"
      );
    });

    it("should return an error if an error occurs", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };
      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.isSizeValid.mockReturnValue(true);
      videoFileService.isVideoFile.mockReturnValue(true);
      videoFileService.create.mockRejectedValue(
        new Error("Error creating video file")
      );

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return an error if an error occurs(no error message)", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.body = {
        title: "Test Video",
        description: "Test Description",
        user_ids: "user1",
      };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.isSizeValid.mockReturnValue(true);
      videoFileService.isVideoFile.mockReturnValue(true);
      videoFileService.create.mockRejectedValue({});

      await controller.createVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error creating video file.",
      });
    });
  });

  describe("getVideosByUser", () => {
    it("should return all videos by user", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { userId: "user1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.getAllByUser.mockResolvedValue([
        { id: "video1" },
      ] as any);

      await controller.getVideosByUser(req as Request, res as Response);

      expect(authService.verifyAccessToken).toHaveBeenCalledWith(
        "Bearer token"
      );
      expect(videoFileService.getAllByUser).toHaveBeenCalledWith("user1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([{ id: "video1" }]);
    });

    it("should return an error if authorization header is missing", async () => {
      await controller.getVideosByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Authorization header is required");
    });

    it("should return an error if user id in token does not match userId", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { userId: "user1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user2",
      } as AccessTokenPayload);

      await controller.getVideosByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: "Invalid user" });
    });

    it("should return an error if an error occurs", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { userId: "user1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.getAllByUser.mockRejectedValue(
        new Error("Error getting videos")
      );

      await controller.getVideosByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error getting videos",
      });
    });

    it("should return an error if an error occurs(no error message)", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { userId: "user1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.getAllByUser.mockRejectedValue({});

      await controller.getVideosByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error getting videos.",
      });
    });
  });

  describe("deleteVideoFile", () => {
    it("should delete a video file and return a success message", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);
      awsService.deleteFile.mockResolvedValue();

      await controller.deleteVideoFile(req as Request, res as Response);

      expect(authService.verifyAccessToken).toHaveBeenCalledWith(
        "Bearer token"
      );
      expect(videoFileService.findOne).toHaveBeenCalledWith("video1");
      expect(videoFileService.delete).toHaveBeenCalledWith("video1");
      expect(awsService.deleteFile).toHaveBeenCalledWith("video1.mp4");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: "Video deleted" });
    });

    it("should return an error if authorization header is missing", async () => {
      await controller.deleteVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Authorization header is required",
      });
    });

    it("should return an error if user id in token does not match user_ids", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user2",
      } as AccessTokenPayload);
      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);

      await controller.deleteVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Invalid user, only the owner can delete the video.",
      });
    });

    it("should return an error if an error occurs", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);

      videoFileService.delete.mockRejectedValue(
        new Error("Error deleting video")
      );

      await controller.deleteVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return an error if an error occurs(no error message)", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);

      videoFileService.delete.mockRejectedValue({});
      await controller.deleteVideoFile(req as Request, res as Response);
    });
  });

  describe("getVideoFile", () => {
    it("should return a video file by id", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);

      await controller.getVideoFile(req as Request, res as Response);

      expect(authService.verifyAccessToken).toHaveBeenCalledWith(
        "Bearer token"
      );
      expect(videoFileService.findOne).toHaveBeenCalledWith("video1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        id: "video1",
        user_ids: "user1",
      });
    });

    it("should return an error if authorization header is missing", async () => {
      await controller.getVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Authorization header is required",
      });
    });

    it("should return an error if user id in token does not match user_ids", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";
      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user2",
      } as AccessTokenPayload);
      videoFileService.findOne.mockResolvedValue({
        id: "video1",
        user_ids: "user1",
      } as any);

      await controller.getVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Invalid user, only the owner can get the video.",
      });
    });

    it("should return an error if an error occurs", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";

      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);
      videoFileService.findOne.mockRejectedValue(
        new Error("Error getting video")
      );

      await controller.getVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: "Error getting video" });
    });

    it("should return an error if an error occurs(no error message)", async () => {
      if (req.headers) req.headers.authorization = "Bearer token";

      req.params = { id: "video1" };

      authService.verifyAccessToken.mockReturnValue({
        id: "user1",
      } as AccessTokenPayload);

      videoFileService.findOne.mockRejectedValue({});
      await controller.getVideoFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error getting video.",
      });
    });
  });
});
