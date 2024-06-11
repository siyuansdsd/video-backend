import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("app_user")
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column("text", { array: true })
  video_id: string[];

  constructor() {
    this.video_id = [];
  }
}
