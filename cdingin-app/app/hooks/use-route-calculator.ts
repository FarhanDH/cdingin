import { useState, useEffect } from "react";
import axios from "axios";
import L from "leaflet";

/**
 * A custom React hook to calculate the driving route and distance between two points using the OSRM API.
 * @param origin - The starting point (technician's location).
 * @param destination - The ending point (customer's location).
 * @returns An object containing the calculated route (as an array of LatLng points), the distance string, and a loading state.
 */
export function useRouteCalculator(
    origin: L.LatLng | null,
    destination: L.LatLng | null,
) {
    const [route, setRoute] = useState<L.LatLngExpression[]>([]);
    const [distance, setDistance] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only fetch the route if both origin and destination are available.
        if (!origin || !destination) {
            return;
        }

        const fetchRoute = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
                );

                const routeData = response.data.routes[0];
                if (routeData) {
                    setDistance(`${(routeData.distance / 1000).toFixed(1)} km`);
                    // OSRM returns [lng, lat], so we need to swap them for Leaflet's [lat, lng].
                    const latLngs = routeData.geometry.coordinates.map(
                        (coord: number[]) => [coord[1], coord[0]],
                    );
                    setRoute(latLngs);
                }
            } catch (error) {
                console.error("Failed to fetch route from OSRM:", error);
                // Optionally, you can set an error state here.
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoute();
    }, [origin, destination]); // Re-run the effect if origin or destination changes.

    return { route, distance, isLoadingRoute: isLoading };
}
