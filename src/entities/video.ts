import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("video")
export class Video {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  description: string;

  @Column()
  url!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date | undefined;

  @Column()
  user_ids!: string;

  @Column()
  size!: number;

  constructor() {
    this.description = "";
  }
}
