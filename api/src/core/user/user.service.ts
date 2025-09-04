import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerProfileRequest } from './dto/user.request';
import { User } from './entities/user.entity';
import { toUserResponse, UserResponse } from './dto/user.response';
import { RoleEnum } from '~/common/enums/role.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}
    private readonly logger = new Logger(UserService.name);

    async registerCustomerProfile(
        request: CreateCustomerProfileRequest,
    ): Promise<User> {
        this.logger.debug(
            `registerCustomerProfile: ${JSON.stringify(request)}`,
        );

        const user = await this.userRepository.findOne({
            where: { email: request.email },
        });

        if (!user) {
            this.logger.warn(`email ${request.email} not found`);
            throw new NotFoundException('Hmm, emailmu belum terdaftar');
        }

        user.full_name = request.fullName;
        user.phone_number = request.phoneNumber;
        user.avatar_url = `https://ui-avatars.com/api/?background=random&color=random&rounded=true&size=128&length=1&bold=true&name=${request.fullName}`;
        user.is_profile_completed = true;

        await this.userRepository.save(user);

        return user;
    }

    async getByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email } });
    }

    async getById(id: string): Promise<User> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async getAllTechnicians(): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: RoleEnum.TECHNICIAN },
        });
    }

    async getMe(id: string): Promise<UserResponse> {
        const data = await this.getById(id);
        return toUserResponse(data);
    }

    async insertEmail(email: string): Promise<User> {
        const user = this.userRepository.create({ email });
        return this.userRepository.save(user);
    }

    createEmailEntity(email: string): User {
        return this.userRepository.create({ email });
    }
}
