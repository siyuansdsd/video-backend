import AWS from "aws-sdk";
import { AwsService } from "../aws.service";
import { mock } from "jest-mock-extended";
import { config } from "dotenv";

config();

const mockUser = {
  id: "1",
  email: "",
  password: "",
  name: "",
  refresh_token: "",
  is_active: false,
};

const payload = { id: "id", email: "email", name: "name" };

// Mock AWS SDK
jest.mock("aws-sdk", () => {
  const mS3 = {
    putPublicAccessBlock: jest.fn().mockImplementation((params) => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
    putBucketPolicy: jest.fn().mockImplementation((params) => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
    listBuckets: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({ Buckets: [] }),
    })),
    createBucket: jest.fn().mockImplementation((params) => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
    upload: jest.fn().mockImplementation((params) => ({
      promise: jest.fn().mockResolvedValue({ Location: "http://mock-url" }),
    })),
    deleteObject: jest.fn().mockImplementation((params) => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
  };
  return { S3: jest.fn(() => mS3) };
});

describe("AwsService", () => {
  let awsService: AwsService;
  let s3: AWS.S3;

  beforeEach(() => {
    awsService = new AwsService();
    s3 = new AWS.S3() as any; // Ensure type compatibility
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      const mockUrl = "http://mock-url";
      (s3.upload as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockResolvedValue({ Location: mockUrl }),
      }));

      const buffer = Buffer.from("test file");
      const result = await awsService.uploadFile(buffer, "test-id");

      expect(s3.upload).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "test-id.mp4",
        Body: buffer,
        ContentType: "video/mp4",
        ContentDisposition: "inline",
      });
      expect(result).toBe(mockUrl);
    });

    it("should throw an error if upload fails", async () => {
      (s3.upload as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockRejectedValue(new Error("Upload failed")),
      }));

      const buffer = Buffer.from("test file");
      await expect(awsService.uploadFile(buffer, "test-id")).rejects.toThrow(
        "Error uploading file"
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete a file successfully", async () => {
      (s3.deleteObject as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockResolvedValue({}),
      }));

      await awsService.deleteFile("test-key");

      expect(s3.deleteObject).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "test-key",
      });
    });

    it("should throw an error if deletion fails", async () => {
      (s3.deleteObject as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockRejectedValue(new Error("Delete failed")),
      }));

      await expect(awsService.deleteFile("test-key")).rejects.toThrow(
        "Error deleting file"
      );
    });
  });

  describe("private methods", () => {
    it("should disable block public access", async () => {
      (s3.putPublicAccessBlock as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockResolvedValue({}),
      }));

      const disableBlockPublicAccess = (awsService as any)
        .disableBlockPublicAccess;
      await disableBlockPublicAccess("test-bucket");

      expect(s3.putPublicAccessBlock).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      });
    });

    it("should set bucket policy", async () => {
      (s3.putBucketPolicy as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockResolvedValue({}),
      }));

      const setBucketPolicy = (awsService as any).setBucketPolicy;
      await setBucketPolicy("test-bucket");

      expect(s3.putBucketPolicy).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
              Resource: `arn:aws:s3:::test-bucket/*`,
            },
          ],
        }),
      });
    });
  });

  describe("checkBucket", () => {
    it("should create bucket if it does not exist", async () => {
      (s3.listBuckets as jest.Mock).mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Buckets: [] }),
      }));
      (s3.createBucket as jest.Mock).mockImplementation((params) => ({
        promise: jest.fn().mockResolvedValue({}),
      }));
      const disableBlockPublicAccess = jest
        .spyOn(awsService as any, "disableBlockPublicAccess")
        .mockResolvedValue({});
      const setBucketPolicy = jest
        .spyOn(awsService as any, "setBucketPolicy")
        .mockResolvedValue({});

      const checkBucket = (awsService as any).checkBucket;
      await checkBucket();

      expect(s3.createBucket).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
      });
      expect(disableBlockPublicAccess).toHaveBeenCalledWith(
        process.env.AWS_BUCKET_NAME
      );
      expect(setBucketPolicy).toHaveBeenCalledWith(process.env.AWS_BUCKET_NAME);
    });

    it("should not create bucket if it exists", async () => {
      (s3.listBuckets as jest.Mock).mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({
          Buckets: [{ Name: process.env.AWS_BUCKET_NAME }],
        }),
      }));

      const checkBucket = (awsService as any).checkBucket;
      await checkBucket();

      expect(s3.createBucket).not.toHaveBeenCalled();
    });
  });
});
