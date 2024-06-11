import { User } from "../entities/user";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  create = async (name: string, email: string, password: string) => {
    const newUser = new User();
    newUser.id = uuid();
    newUser.email = email;
    newUser.password = password;
    newUser.name = name;
    await this.userRepository.save(newUser);
  };

  findAll = async (): Promise<User[]> => {
    return await this.userRepository.find();
  };

  findOne = async (id: string): Promise<User> => {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new Error("User not found.");
    }
  };
}
