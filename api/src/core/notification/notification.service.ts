import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/notification.request';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRead } from '../notification-read/entities/notification-read.entity';
import {
    NotificationResponse,
    toNotificationResponse,
} from './dto/notification.response';
import { NotificationType } from '~/common/enums/notification-type.enum';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationRead)
        private readonly notificationReadRepository: Repository<NotificationRead>,
    ) {}

    private readonly logger: Logger = new Logger(NotificationService.name);

    async create(createNotificationDto: CreateNotificationDto) {
        this.logger.debug(
            `NotificationService.create(): ${JSON.stringify(createNotificationDto)}`,
        );
        try {
            const notificationEntity = this.notificationRepository.create({
                title: createNotificationDto.title,
                message: createNotificationDto.message,
                type: createNotificationDto.type,
                recipient: { id: createNotificationDto.recipientId ?? null },
                order: { id: createNotificationDto.orderId ?? null },
            });

            const savedNotification =
                await this.notificationRepository.save(notificationEntity);
            console.log(savedNotification);

            return await this.getById(savedNotification.id);
        } catch (error) {
            this.logger.error(`Error creating notification: ${error}`);
            throw new InternalServerErrorException(
                'Failed to create notification',
            );
        }
    }

    async getById(id: string): Promise<Notification> {
        this.logger.debug(`NotificationService.getById(): ${id}`);
        return await this.notificationRepository.findOne({
            where: { id },
            relations: {
                recipient: true,
                reads: true,
            },
        });
    }

    /**
     * Get all notifications for a given user
     *
     * @param userId ID of the user to fetch notifications for
     * @returns An array of NotificationResponse objects, which include the notification
     *          details and a boolean indicating whether the notification has been read
     */
    async getAllNotificationByUser(
        userId: string,
    ): Promise<NotificationResponse[]> {
        this.logger.debug(
            `NotificationService.getAllNotificationByUser(): ${userId}`,
        );
        // const notifications = await this.notificationRepository.find({
        //     where: [{ recipient: null }],
        //     relations: {
        //         reads: true,
        //         recipient: true,
        //         order: true,
        //     },
        // });
        const notifications = await this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.reads', 'reads') // Penting: Join untuk cek status baca
            .leftJoinAndSelect('reads.user', 'readUser')
            .leftJoinAndSelect('notification.order', 'order') // Penting: Join untuk detail pesanan
            .where('notification.recipient.id = :userId', { userId })
            .orWhere('notification.recipient IS NULL')
            .andWhere('notification.type != :type', {
                type: NotificationType.NEW_ORDER,
            })
            .orderBy('notification.created_at', 'DESC')
            .getMany();

        return notifications.map((notification) =>
            toNotificationResponse(notification, userId),
        );
    }
}
