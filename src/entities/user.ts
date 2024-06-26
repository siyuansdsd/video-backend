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

  @Column()
  refresh_token: string;

  @Column({ default: false })
  is_active: boolean;

  constructor() {
    this.is_active = false;
    this.refresh_token = "";
  }
}
