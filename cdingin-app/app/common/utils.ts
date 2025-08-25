import haversine from "haversine-distance";

export const formattedDate = (date: Date, time = false) => {
    const formatDate = new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const formatTime = `${new Date(date).getHours()}:${new Date(
        date,
    ).getMinutes()}`;

    return `${formatDate} ${time ? formatTime : ""}`;
};

/**
 * Calculates the distance in meters between two geographical points.
 * @param pointA - The first point { lat: number, lng: number }.
 * @param pointB - The second point { lat: number, lng: number }.
 * @returns The distance in meters.
 */
export function calculateDistanceInMeters(
    pointA: { lat: number; lng: number },
    pointB: { lat: number; lng: number },
): number {
    return haversine(pointA, pointB);
}
