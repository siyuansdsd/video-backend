import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("video")
export class Video {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  url!: string;

  @Column()
  user_id!: string;
}
