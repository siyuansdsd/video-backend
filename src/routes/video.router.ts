import { Router } from "express";
import { VideoFileController } from "../controllers/video_file/videoFile.controller";
import { VideoFileService } from "../service/video_file/videoFile.service";
import { AppDataSource } from "../data-source";
import { Video } from "../entities/video";
import { AuthService } from "../service/auth/auth.service";
import upload from "../middleware/upload";

const videoRouter = Router();
const videoRepository = AppDataSource.getRepository(Video);
const videoFileService = new VideoFileService(videoRepository);
const authService = new AuthService();
const videoController = new VideoFileController(videoFileService, authService);

videoRouter.post(
  "/video",
  upload.single("file"),
  videoController.createVideoFile
);
videoRouter.delete("/video/:id", videoController.deleteVideoFile);
videoRouter.get("/video/:id", videoController.getVideoFile);
videoRouter.get("/video/user/:userId", videoController.getVideosByUser);

export default videoRouter;
