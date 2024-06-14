import { Repository } from "typeorm";
import { Video } from "../../entities/video";
import { v4 as uuid } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough, finished } from "stream";
import { promisify } from "util";

export class VideoFileService {
  private videoRepository: Repository<Video>;

  constructor(videoRepository: Repository<Video>) {
    this.videoRepository = videoRepository;
  }

  public create = async (
    title: string,
    description: string,
    user_ids: string,
    size: number
  ): Promise<Video> => {
    const video = new Video();
    video.id = uuid();
    video.title = title;
    video.description = description;
    video.url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${video.id}.mp4`;
    video.user_ids = user_ids;
    video.size = size;
    return await this.videoRepository.save(video);
  };

  public delete = async (id: string): Promise<void> => {
    await this.videoRepository.delete(id);
  };

  public findOne = async (id: string): Promise<Video> => {
    const video = await this.videoRepository.findOneOrFail({
      where: { id: id },
    });
    if (!video) {
      throw new Error("Video not found");
    }
    return video;
  };

  public getAllByUser = async (user_ids: string): Promise<Video[]> => {
    return await this.videoRepository.find({ where: { user_ids } });
  };

  public convertFileToMP4 = async (
    file: Express.Multer.File,
    outputFormat: string
  ): Promise<Buffer> => {
    const fileBuffer = file.buffer;
    const input = new PassThrough();
    const chunks: Buffer[] = [];
    const ffmpegCommand = ffmpeg()
      .input(input)
      .output(outputFormat)
      .on("error", (err) => {
        throw err;
      });

    const outputStream = ffmpegCommand.pipe(new PassThrough());
    input.end(fileBuffer);

    outputStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    await promisify(finished)(outputStream);

    return Buffer.concat(chunks);
  };

  isVideoFile = (file: Express.Multer.File): boolean => {
    const videoMimeTypes = [
      "video/mp4",
      "video/quicktime", // mov
      "video/x-msvideo", // avi
      "video/x-matroska", // mkv
    ];
    return videoMimeTypes.includes(file.mimetype);
  };

  isMp4File = (file: Express.Multer.File): boolean => {
    const mp4MimeTypes = ["video/mp4"];
    return mp4MimeTypes.includes(file.mimetype);
  };

  isSizeValid = (size: number): boolean => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    return size <= maxSize;
  };
}
