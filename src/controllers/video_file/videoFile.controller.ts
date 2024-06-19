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
      !req.body.user_ids ||
      !req.file
    ) {
      res.status(400).send({ message: "Missing required fields" });
      return;
    }
    const { title, description, user_ids } = req.body;
    const file = req.file;
    let fileBuffer = file.buffer;
    try {
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      if (decode.id !== user_ids) {
        res.status(401).send({ message: "Invalid user" });
        return;
      }
      if (!this.videoFileService.isSizeValid(file.size)) {
        res.status(400).send({
          message: "file size is too large, the biggest file size is 100MB.",
        });
        return;
      }
      if (!this.videoFileService.isVideoFile(file)) {
        res.status(400).send({ message: "Invalid file format" });
        return;
      }
      if (!this.videoFileService.isMp4File(file)) {
        fileBuffer = await this.videoFileService.convertFileToMP4(file, "mp4");
      }
      const videoInfo = await this.videoFileService.create(
        title,
        description,
        user_ids,
        file.size
      );
      await this.awsService.uploadFile(fileBuffer, videoInfo.id);
      res.status(201).send({ message: "A new video file created!" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating video file.";
      res.status(500).send({ message: errorMessage });
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
      if (decode.id !== userId) {
        res.status(401).send({ message: "Invalid user" });
        return;
      }
      const videos = await this.videoFileService.getAllByUser(decode.id);
      res.status(200).send(videos);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error getting videos.";
      res.status(500).send({ message: errorMessage });
    }
  };

  deleteVideoFile = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      res.status(401).send({ message: "Authorization header is required" });
      return;
    }
    try {
      const { id } = req.params;
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      const video = await this.videoFileService.findOne(id);
      if (video.user_ids !== decode.id) {
        res.status(401).send({
          message: "Invalid user, only the owner can delete the video.",
        });
        return;
      }
      await this.videoFileService.delete(id);
      await this.awsService.deleteFile(id + ".mp4");
      res.status(200).send({ message: "Video deleted" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error deleting video.";
      res.status(500).send({ message: errorMessage });
    }
  };

  getVideoFile = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      res.status(401).send({ message: "Authorization header is required" });
      return;
    }
    try {
      const { id } = req.params;
      const decode = this.authService.verifyAccessToken(
        req.headers.authorization
      ) as AccessTokenPayload;
      const video = await this.videoFileService.findOne(id);
      if (video.user_ids !== decode.id) {
        res.status(401).send({
          message: "Invalid user, only the owner can get the video.",
        });
        return;
      }
      res.status(200).send(video);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error getting video.";
      res.status(500).send({ message: errorMessage });
    }
  };
}
