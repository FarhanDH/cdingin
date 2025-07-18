import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async insertEmail(email: string): Promise<User> {
    const user = this.userRepository.create({ email });
    return this.userRepository.save(user);
  }

  async createEmailEntity(email: string): Promise<User> {
    return this.userRepository.create({ email });
  }
}
