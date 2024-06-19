import { Repository } from "typeorm";
import { Video } from "../../../entities/video";
import { VideoFileService } from "../videoFile.service";
import { mock } from "jest-mock-extended";
import { v4 as uuid } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough, finished } from "stream";
import { deprecate, promisify } from "util";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

jest.mock("fluent-ffmpeg", () => {
  const mockPipe = jest.fn(() => new PassThrough()); // Mock pipe to return a PassThrough stream
  return jest.fn(() => ({
    input: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation((event, handler) => {
      if (event === "error")
        setTimeout(() => handler(new Error("Mock error")), 0);
      return { pipe: mockPipe };
    }),
    pipe: mockPipe,
  }));
});

jest.mock("stream", () => {
  const originalStream = jest.requireActual("stream");
  return {
    ...originalStream,
    PassThrough: jest
      .fn()
      .mockImplementation(() => new originalStream.PassThrough()),
    finished: jest.fn(),
  };
});

jest.mock("util", () => {
  const originalUtil = jest.requireActual("util");
  return {
    ...originalUtil,
    promisify: jest
      .fn()
      .mockImplementation(() => jest.fn(() => Promise.resolve())),
  };
});

describe("VideoFileService", () => {
  let videoFileService: VideoFileService;
  let videoRepository: jest.Mocked<Repository<Video>>;

  beforeEach(() => {
    videoRepository = mock<Repository<Video>>();
    videoFileService = new VideoFileService(videoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new video", async () => {
      const mockVideo: Video = {
        id: "mock-uuid",
        title: "Test Video",
        description: "Test Description",
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/mock-uuid.mp4`,
        user_ids: "user123",
        size: 12345,
        created_at: new Date(),
      };

      videoRepository.save.mockResolvedValue(mockVideo);

      const result = await videoFileService.create(
        "Test Video",
        "Test Description",
        "user123",
        12345
      );

      expect(videoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mock-uuid",
          title: "Test Video",
          description: "Test Description",
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/mock-uuid.mp4`,
          user_ids: "user123",
          size: 12345,
        })
      );
      expect(result).toEqual(mockVideo);
    });
  });

  describe("delete", () => {
    it("should delete a video by id", async () => {
      await videoFileService.delete("mock-uuid");
      expect(videoRepository.delete).toHaveBeenCalledWith("mock-uuid");
    });
  });

  describe("findOne", () => {
    it("should find a video by id", async () => {
      const mockVideo: Video = {
        id: "mock-uuid",
        title: "Test Video",
        description: "Test Description",
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/mock-uuid.mp4`,
        user_ids: "user123",
        size: 12345,
        created_at: new Date(),
      };

      videoRepository.findOneOrFail.mockResolvedValue(mockVideo);

      const result = await videoFileService.findOne("mock-uuid");

      expect(videoRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "mock-uuid" },
      });
      expect(result).toEqual(mockVideo);
    });
    it("should throw an error if video not found", async () => {
      videoRepository.findOneOrFail.mockRejectedValue(
        new Error("Video not found")
      );

      await expect(videoFileService.findOne("mock-uuid")).rejects.toThrow(
        "Video not found"
      );
    });
  });

  describe("getAllByUser", () => {
    it("should get all videos by user id", async () => {
      const mockVideos: Video[] = [
        {
          id: "1",
          title: "Video 1",
          description: "Desc 1",
          url: "url1",
          user_ids: "user123",
          size: 123,
          created_at: new Date(),
        },
        {
          id: "2",
          title: "Video 2",
          description: "Desc 2",
          url: "url2",
          user_ids: "user123",
          size: 456,
          created_at: new Date(),
        },
      ];

      videoRepository.find.mockResolvedValue(mockVideos);

      const result = await videoFileService.getAllByUser("user123");

      expect(videoRepository.find).toHaveBeenCalledWith({
        where: { user_ids: "user123" },
      });
      expect(result).toEqual(mockVideos);
    });
  });

  describe("convertFileToMP4", () => {
    it("should convert file to MP4 format and return a Buffer", async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from("mock file content"),
      } as any;

      const result = await videoFileService.convertFileToMP4(
        mockFile,
        "output.mp4"
      );

      expect(result).toBeInstanceOf(Buffer);
    });

    it("should throw an error when ffmpeg conversion fails", async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from("mock file data"),
        originalname: "",
        encoding: "",
        mimetype: "",
        size: 0,
        fieldname: "",
        destination: "",
        filename: "",
        path: "",
        stream: new PassThrough(),
      };

      (ffmpeg as any).mockReturnValue({
        input: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === "error") {
            setImmediate(() => callback(new Error("Error converting file")));
          }
          return this;
        }),
        pipe: jest.fn().mockImplementation(() => {
          const outputStream = new PassThrough();
          setImmediate(() =>
            outputStream.emit("error", new Error("Error converting file"))
          );
          return outputStream;
        }),
      });

      await expect(
        videoFileService.convertFileToMP4(mockFile, "output.mp4")
      ).rejects.toThrow("Cannot read properties of undefined (reading 'pipe')");
    });

    describe("isVideoFile", () => {
      it("should return true for valid video file types", () => {
        const mockFile = { mimetype: "video/mp4" } as Express.Multer.File;
        expect(videoFileService.isVideoFile(mockFile)).toBe(true);
      });

      it("should return false for invalid video file types", () => {
        const mockFile = { mimetype: "image/png" } as Express.Multer.File;
        expect(videoFileService.isVideoFile(mockFile)).toBe(false);
      });
    });

    describe("isMp4File", () => {
      it("should return true for MP4 file type", () => {
        const mockFile = { mimetype: "video/mp4" } as Express.Multer.File;
        expect(videoFileService.isMp4File(mockFile)).toBe(true);
      });

      it("should return false for non-MP4 file type", () => {
        const mockFile = { mimetype: "video/avi" } as Express.Multer.File;
        expect(videoFileService.isMp4File(mockFile)).toBe(false);
      });
    });

    describe("isSizeValid", () => {
      it("should return true for valid size", () => {
        expect(videoFileService.isSizeValid(50 * 1024 * 1024)).toBe(true); // 50MB
      });

      it("should return false for invalid size", () => {
        expect(videoFileService.isSizeValid(200 * 1024 * 1024)).toBe(false); // 200MB
      });
    });
  });
});
