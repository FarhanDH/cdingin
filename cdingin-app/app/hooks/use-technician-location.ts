import { useState, useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";

/**
 * A custom React hook to get and track the technician's current geolocation.
 * It supports both one-time fetching and continuous watching.
 */
export function useTechnicianLocation() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    // useRef to hold the watch ID, so we can clear it later.
    const watchIdRef = useRef<number | null>(null);

    /**
     * Fetches the user's location a single time.
     */
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung.");
            return;
        }
        setIsFetching(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition(
                    new L.LatLng(pos.coords.latitude, pos.coords.longitude)
                );
                console.log(pos.coords.latitude, pos.coords.longitude);
                setError(null);
                setIsFetching(false);
            },
            () => {
                setError("Gagal mendapatkan lokasi.");
                toast(
                    "Gagal mendapatkan lokasimu. Pastikan GPS aktif.",
                    customToastStyle
                );
                setIsFetching(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    /**
     * Starts continuously watching the user's position.
     * Updates the position state whenever the user moves.
     */
    const startWatching = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung.");
            return;
        }
        // Clear any existing watch to prevent duplicates
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        console.log("[Location] Starting to watch position...");
        setIsFetching(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
            // Success callback (fires on every position update)
            (pos) => {
                setPosition(
                    new L.LatLng(pos.coords.latitude, pos.coords.longitude)
                );
                setError(null);
                setIsFetching(false); // Set to false after the first successful watch
            },
            // Error callback
            () => {
                setError("Gagal melacak lokasi.");
                toast(
                    "Gagal melacak lokasimu secara real-time.",
                    customToastStyle
                );
                setIsFetching(false);
            },
            // Options: High accuracy is important for tracking.
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    /**
     * Stops watching the user's position.
     * This is crucial for saving battery.
     */
    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            console.log("[Location] Stopping position watch.");
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    // Cleanup effect: Ensure we stop watching when the component unmounts.
    useEffect(() => {
        return () => {
            stopWatching();
        };
    }, [stopWatching]);

    return {
        position,
        error,
        isFetching,
        requestLocation, // For one-time fetch
        startWatching, // To start tracking
        stopWatching, // To stop tracking
    };
}
