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
        const notifications = await this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.reads', 'reads')
            .leftJoinAndSelect('reads.user', 'readUser')
            .leftJoinAndSelect('notification.order', 'order')
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

    /**
     * Mark a notification as read by a user.
     *
     * @param userId The ID of the user marking the notification as read
     * @param notificationId The ID of the notification being marked as read
     * @throws InternalServerErrorException if the notification cannot be marked as read
     */
    async markAsRead(userId: string, notificationId: string): Promise<void> {
        // Check if the notification has already been marked as read
        const notificationReadExists = await this.notificationReadRepository
            .createQueryBuilder('read')
            .where('read.notification.id = :notificationId', {
                notificationId,
            })
            .andWhere('read.user.id = :userId', { userId })
            .getOne();

        if (!notificationReadExists) {
            // Create a new read entry if the notification isn't already marked as read
            const newReadEntry = this.notificationReadRepository.create({
                user: { id: userId },
                notification: { id: notificationId },
            });
            await this.notificationReadRepository.save(newReadEntry);
            this.logger.log(
                `Notification ${notificationId} marked as read by user ${userId}.`,
            );
        } else {
            // Log a message if the notification is already marked as read
            this.logger.log(
                `Notification ${notificationId} is already read by user ${userId}.`,
            );
        }
    }
}
