import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

export class AwsService {
  private s3: AWS.S3;
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  private disableBlockPublicAccess = async (bucketName: string) => {
    const params = {
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    };
    await this.s3.putPublicAccessBlock(params).promise();
  };

  private setBucketPolicy = async (bucketName: string) => {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };
    const params = {
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    };
    await this.s3.putBucketPolicy(params).promise();
    console.log("Bucket policy set successfully");
  };

  private checkBucket = async () => {
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const buckets = await this.s3.listBuckets().promise();
    const isBucketExit = buckets.Buckets?.find((b) => b.Name === bucketName);
    if (!isBucketExit) {
      await this.s3.createBucket({ Bucket: bucketName }).promise();
      console.log("Bucket created successfully");
      await this.disableBlockPublicAccess(bucketName);
      await this.setBucketPolicy(bucketName);
    }
  };

  uploadFile = async (FileBuffer: Buffer, id: string) => {
    await this.checkBucket();
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const params = {
      Bucket: bucketName,
      Key: id + ".mp4",
      Body: FileBuffer,
      ContentType: "video/mp4",
      ContentDisposition: "inline",
    };
    try {
      const data = await this.s3.upload(params).promise();
      console.log("File uploaded successfully", data.Location);
      const url = data.Location;
      return url;
    } catch (error) {
      console.log("Error uploading file", error);
      throw new Error("Error uploading file");
    }
  };

  deleteFile = async (key: string) => {
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    try {
      await this.s3.deleteObject(params).promise();
      console.log("File deleted successfully");
    } catch (error) {
      console.log("Error deleting file", error);
      throw new Error("Error deleting file");
    }
  };
}
