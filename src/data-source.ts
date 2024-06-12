import "reflect-metadata";
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
  synchronize: false,
  logging: false,
  entities: [User, Video],
  migrations: [],
  subscribers: [],
  extra: {
    max: 10,
    min: 2,
  },
});

AppDataSource.initialize()
  .then(() => console.log("Database connected!"))
  .catch((error) => console.error("Error connecting to database: ", error));
