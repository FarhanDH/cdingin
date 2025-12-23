export type NotificationItem = {
    id: string;
    title: string;
    body: string;
    type: string;
    createdAt: string;
    isRead: boolean;
    orderId?: string | null;
};
