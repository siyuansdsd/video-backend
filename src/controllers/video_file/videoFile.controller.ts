import { VideoFileService } from "../../service/video_file/videoFile.service";
import { AuthService } from "../../service/auth/auth.service";
import { AwsService } from "../../service/aws/aws.service";
import { AccessTokenPayload } from "../../interfaces/accessTokenPayload";
import { Request, Response } from "express";

export class VideoFileController {
  private videoFileService;
  private authService;
  private awsService;
  constructor(videoFileService: VideoFileService, authService: AuthService) {
    this.videoFileService = videoFileService;
    this.authService = authService;
    this.awsService = new AwsService();
  }

  createVideoFile = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      res.status(401).send("Authorization header is required");
      return;
    }
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.url ||
      !req.body.user_ids ||
      !req.file
    ) {
      res.status(400).send("Missing required fields");
      return;
    }
    const { title, description, url, user_ids } = req.body;
    const file = req.file;
    let fileBuffer = file.buffer;
    try {
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      if (!decode) {
        res.status(401).send("Invalid token");
        return;
      }
      if (decode.id !== user_ids) {
        res.status(401).send("Invalid user");
        return;
      }
      if (!this.videoFileService.isSizeValid(file.size)) {
        res
          .status(400)
          .send("file size is too large, the biggest file size is 100MB.");
        return;
      }
      if (!this.videoFileService.isVideoFile(file)) {
        res.status(400).send("Invalid file format");
        return;
      }
      if (!this.videoFileService.isMp4File) {
        fileBuffer = await this.videoFileService.convertFileToMP4(file, "mp4");
      }
      const videoInfo = await this.videoFileService.create(
        title,
        description,
        user_ids,
        file.size
      );
      await this.awsService.uploadFile(fileBuffer, videoInfo.id);
      res.status(201).send("A new video file created!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating video file.";
      res.status(500).send(errorMessage);
    }
  };

  getVideosByUser = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      res.status(401).send("Authorization header is required");
      return;
    }
    try {
      const { userId } = req.params;
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      if (!decode) {
        res.status(401).send("Invalid token");
        return;
      }
      if (decode.id !== userId) {
        res.status(401).send("Invalid user");
        return;
      }
      const videos = await this.videoFileService.getAllByUser(decode.id);
      res.status(200).send(videos);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error getting videos.";
      res.status(500).send(errorMessage);
    }
  };

  deleteVideoFile = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      res.status(401).send("Authorization header is required");
      return;
    }
    try {
      const { id } = req.params;
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      if (!decode) {
        res.status(401).send("Invalid token");
        return;
      }
      const video = await this.videoFileService.findOne(id);
      if (video.user_ids !== decode.id) {
        res
          .status(401)
          .send("Invalid user, only the owner can delete the video.");
        return;
      }
      await this.videoFileService.delete(id);
      await this.awsService.deleteFile(id);
      res.status(200).send("Video deleted");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error deleting video.";
      res.status(500).send(errorMessage);
    }
  };
}
