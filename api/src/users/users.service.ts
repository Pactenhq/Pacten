import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: { brandProfile: true, creatorProfile: true, professionalProfile: true } as any,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    const { passwordHash, verificationToken, ...safe } = user as any;
    return safe;
  }
}
