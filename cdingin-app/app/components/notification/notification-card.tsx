import { Button } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router";
import { formatRelativeTime } from "~/common/utils";
import type { NotificationItem } from "~/types/notification.types";

export interface NotificationCardProps {
    notification: NotificationItem;
}

/**
 * A card component to display a single notification item.
 * It visually distinguishes between read and unread states.
 */
export default function NotificationCard({
    notification,
}: Readonly<NotificationCardProps>) {
    const navigate = useNavigate();

    // Convert date to readable
    const relativeTime = formatRelativeTime(notification.createdAt);

    /**
     * Handle the card click event.
     * Mark the notification as read and navigate to the order page.
     */
    const handleCardClick = async () => {
        try {
            // Mark the notification as read
            await axios.post(
                `${import.meta.env.VITE_API_URL}/notifications/${
                    notification.id
                }/read`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            // Catch any errors and log them
            console.error("Failed to mark notification as read:", error);
            return;
        }

        // Navigate to the order page
        navigate(`/order/${notification.orderId}`);
    };

    return (
        // Main container with padding, border, and conditional background color
        <Button
            className="w-full cursor-pointer normal-case p-0 font-[Rubik] font-normal text-base tracking-[0px]"
            onClick={handleCardClick}
        >
            <div
                className={`text-start w-full p-4 border-b border-gray-200 ${
                    notification.isRead ? "bg-white" : "bg-blue-50" // Use a light blue for unread items
                }`}
            >
                <div className="flex items-start gap-2">
                    {/* Unread indicator dot */}
                    <div className="flex-shrink-0 pt-1.5">
                        <div
                            className={`h-2.5 w-2.5 rounded-full ${
                                notification.isRead
                                    ? "bg-transparent"
                                    : "bg-secondary" // Show blue dot only if unread
                            }`}
                        ></div>
                    </div>

                    {/* Main content area */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-baseline mb-1">
                            {/* Title with emoji/icon support */}
                            <h1
                                className={`font-bold ${
                                    notification.isRead
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                }`}
                                // Allow HTML to render emojis correctly from backend if needed
                                dangerouslySetInnerHTML={{
                                    __html: notification.title,
                                }}
                            />
                            {/* Timestamp, aligned to the right */}
                            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                                {relativeTime}
                            </p>
                        </div>
                        {/* Body text */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.body}
                        </p>
                    </div>
                </div>
            </div>
        </Button>
    );
}
