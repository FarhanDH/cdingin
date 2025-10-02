import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import haversine from "haversine-distance";

export const formattedDate = (
    date: Date,
    options: {
        withTime?: boolean;
        withDay?: boolean;
        locale?: string;
    } = {}
) => {
    const defaultOptions = { withTime: false, withDay: true, locale: "id-ID" };
    const mergedOptions = { ...defaultOptions, ...options };

    const dateOptions = {
        weekday: mergedOptions.withDay ? "long" : undefined,
        day: "numeric",
        month: "long",
        year: "numeric",
    } as const;

    const formatDate = new Date(date).toLocaleDateString(
        mergedOptions.locale,
        dateOptions
    );

    const formatTime = `${new Date(date).getHours()}:${new Date(
        date
    ).getMinutes()}`;

    return `${formatDate} ${mergedOptions.withTime ? formatTime : ""}`.trim();
};

/**
 * Calculates the distance in meters between two geographical points.
 * @param pointA - The first point { lat: number, lng: number }.
 * @param pointB - The second point { lat: number, lng: number }.
 * @returns The distance in meters.
 */
export function calculateDistanceInMeters(
    pointA: { lat: number; lng: number },
    pointB: { lat: number; lng: number }
): number {
    return haversine(pointA, pointB);
}

/**
 * Converts a VAPID key from a URL-safe base64 string to a Uint8Array.
 * This is required by the browser's Push API.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Formats a date string into a relative time string (e.g., "5 minutes ago").
 * @param dateString - The ISO date string to format.
 * @returns A user-friendly relative time string.
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
}

export function prettyDate(targetDate: Date, locale = "id") {
    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const startOfTarget = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
    );

    const diffMs = (startOfTarget as number) - (startOfToday as number);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "hari ini";
    if (diffDays === 1) return "besok";
    if (diffDays === -1) return "kemarin";

    if (Math.abs(diffDays) <= 7) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
        return rtf.format(diffDays, "day");
    }

    const diffMonths =
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth());
    if (Math.abs(diffMonths) < 12) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
        return rtf.format(diffMonths, "month");
    }

    const diffYears = targetDate.getFullYear() - now.getFullYear();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return rtf.format(diffYears, "year");
}
