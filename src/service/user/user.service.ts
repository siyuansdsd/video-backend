import { User } from "../../entities/user";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  getMe = async (id: string): Promise<User> => {
    return await this.userRepository.findOneOrFail({ where: { id } });
  };

  create = async (name: string, email: string, password: string) => {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new Error("Email already exists.");
    }
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

  findOne = async (email: string): Promise<User> => {
    const user = this.userRepository.findOneOrFail({ where: { email } });
    return user;
  };

  update = async (id: string, name?: string, password?: string) => {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    if (name) user.name = name;
    if (password) user.password = password;
    await this.userRepository.save(user);
  };

  addFreshToken = async (token: string, email: string) => {
    const user = await this.userRepository.findOneOrFail({ where: { email } });
    user.refresh_token = token;
    await this.userRepository.save(user);
  };

  active = async (id: string) => {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    user.is_active = true;
    await this.userRepository.save(user);
  };
}
