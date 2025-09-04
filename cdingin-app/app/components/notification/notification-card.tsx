import { Button } from "@mui/material";
import { formatRelativeTime } from "~/common/utils";

export interface NotificationCardProps {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    isRead: boolean;
}

/**
 * A card component to display a single notification item.
 * It visually distinguishes between read and unread states.
 */
export default function NotificationCard({
    title,
    body,
    createdAt,
    isRead,
}: Readonly<NotificationCardProps>) {
    const relativeTime = formatRelativeTime(createdAt);

    return (
        // Main container with padding, border, and conditional background color
        <Button className="w-full cursor-pointer normal-case p-0 font-[Rubik] font-normal text-base tracking-[0px]">
            <div
                className={`text-start w-full p-4 border-b border-gray-200 ${
                    isRead ? "bg-white" : "bg-blue-50" // Use a light blue for unread items
                }`}
            >
                <div className="flex items-start gap-2">
                    {/* Unread indicator dot */}
                    <div className="flex-shrink-0 pt-1.5">
                        <div
                            className={`h-2.5 w-2.5 rounded-full ${
                                isRead ? "bg-transparent" : "bg-secondary" // Show blue dot only if unread
                            }`}
                        ></div>
                    </div>

                    {/* Main content area */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-baseline mb-1">
                            {/* Title with emoji/icon support */}
                            <h1
                                className={`font-bold ${
                                    isRead ? "text-gray-500" : "text-gray-900"
                                }`}
                                // Allow HTML to render emojis correctly from backend if needed
                                dangerouslySetInnerHTML={{ __html: title }}
                            />
                            {/* Timestamp, aligned to the right */}
                            <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                                {relativeTime}
                            </p>
                        </div>
                        {/* Body text */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {body}
                        </p>
                    </div>
                </div>
            </div>
        </Button>
    );
}
