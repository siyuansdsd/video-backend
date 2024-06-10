import { DataSource } from "typeorm";
import { User } from "./entities/user";
import { Video } from "./entities/video";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5445,
  username: "admin",
  password: "123",
  database: "videoDB",
  synchronize: true,
  logging: false,
  entities: [User, Video],
  migrations: [],
  subscribers: [],
  extra: {
    max: 10,
    min: 2,
  },
});