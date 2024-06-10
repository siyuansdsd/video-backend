import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
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
  userId!: string;
}
