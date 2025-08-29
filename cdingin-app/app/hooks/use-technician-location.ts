import L from "leaflet";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";

/**
 * A custom React hook to get the technician's current geolocation ON DEMAND.
 * It no fetches the location automatically on mount.
 * @returns An object containing the technician's position, any error message, and a function to request the location.
 */
export function useTechnicianLocation() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung oleh browser ini.");
            toast(
                "Geolocation tidak didukung oleh browser ini.",
                customToastStyle
            );
            return;
        }

        setIsFetching(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            // Success callback
            (pos) => {
                setPosition(
                    new L.LatLng(pos.coords.latitude, pos.coords.longitude)
                );
                setIsFetching(false);
            },
            // Error callback
            (err) => {
                setError("Gagal mendapatkan lokasimu. Pastikan GPS aktif.");
                toast(
                    "Gagal mendapatkan lokasimu. Pastikan GPS aktif, ya.",
                    customToastStyle
                );
                setIsFetching(false);
            },
            // Options
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []); // Empty dependency array ensures this runs only once on mount.

    // Return the state and the function to manually trigger a refresh.
    return { position, error, isFetching, requestLocation };
}
