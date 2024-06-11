import { User } from "../entities/user";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";
import { AppDataSource as dataSource } from "../data-source";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create(name: string, email: string, password: string) {
    const newUser = new User();
    newUser.id = uuid();
    newUser.email = email;
    newUser.password = password;
    newUser.name = name;
    await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new Error("User not found.");
    }
  }
}
