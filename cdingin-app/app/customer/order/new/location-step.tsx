import LocationPinIcon from "@mui/icons-material/LocationPin";
import { Button, Fab } from "@mui/material";
import axios from "axios";
import { MoveLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import addNote from "~/assets/add-note.png";
import noteSucces from "~/assets/note-success.png";
import EnableLocationSheet from "../../../components/enable-location-sheet";
import LocationNoteSheet from "./maps/location-note-sheet";
import LocationPicker from "./maps/location-picker";
import { samarindaServiceArea } from "~/common/geo-data";
import pointInPolygon from "point-in-polygon";
import { Polygon, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { customToastStyle } from "~/common/custom-toast-style";
import L from "leaflet";
import LocationSearch from "./maps/location-search";

const samarindaServiceAreaForLeaflet: LatLngExpression[] =
    samarindaServiceArea.map(
        (p) => [p[1], p[0]] // Swap to [lat, lng]
    );

function MapController({
    targetPosition,
}: {
    targetPosition: L.LatLng | null;
}) {
    const map = useMap();
    useEffect(() => {
        if (targetPosition) {
            map.flyTo(targetPosition, 18, {
                animate: true,
                duration: 1.5,
            });
        }
    }, [targetPosition, map]);

    return null;
}

export interface LocationStepProps {
    initialLocation: {
        latitude: number;
        longitude: number;
        address: string;
        note: string;
    };
    onSubmit: (data: {
        note: string;
        address: string;
        latitude: number;
        longitude: number;
    }) => void;
    onBack: () => void;
}

export default function LocationStep({
    initialLocation,
    onSubmit,
    onBack,
}: Readonly<LocationStepProps>) {
    const [address, setAddress] = useState(
        initialLocation?.address || "Memuat alamat..."
    );
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [coordinates, setCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(
        initialLocation
            ? {
                  lat: initialLocation.latitude,
                  lng: initialLocation.longitude,
              }
            : null
    );
    const [locationDetails, setLocationDetails] = useState<any>(null);
    const [locationPermission, setLocationPermission] = useState<
        "prompt" | "granted" | "denied"
    >("prompt");
    const [isLocationPermissionSheetOpen, setIsLocationPermissionSheetOpen] =
        useState(false);
    const [locationNote, setLocationNote] = useState(
        initialLocation?.note || ""
    );
    const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
    const [isLocationValid, setIsLocationValid] = useState(true);
    const [targetPosition, setTargetPosition] = useState<L.LatLng | null>(null);

    /**
     * Checks the current status of the geolocation permission.
     * Updates the state and decides whether to show the prompt sheet.
     */
    const checkPermissionStatus = useCallback(async () => {
        if (!navigator.permissions) {
            // Fallback for older browsers
            setLocationPermission("granted");
            return;
        }
        try {
            const permissionStatus = await navigator.permissions.query({
                name: "geolocation",
            });
            setLocationPermission(permissionStatus.state); // 'granted', 'prompt', or 'denied'

            // Show the sheet only if the user hasn't made a choice yet ('prompt')
            if (permissionStatus.state === "prompt") {
                setIsLocationPermissionSheetOpen(true);
            }

            // Listen for changes (e.g., user allows/blocks from browser settings)
            permissionStatus.onchange = () => {
                setLocationPermission(permissionStatus.state);
                if (permissionStatus.state === "granted") {
                    setIsLocationPermissionSheetOpen(false); // Automatically close sheet if permission is granted
                }
            };
        } catch (error) {
            console.error("Permission query failed:", error);
            // Assume granted if query fails, to not block the user
            setLocationPermission("granted");
        }
    }, []);

    /**
     * A function that takes a set of coordinates and checks if they are within the Samarinda service area.
     * @param coords - The coordinates to check, in the format { lat: number, lng: number }
     * @returns A boolean indicating whether the coordinates are within the service area.
     */
    const validateLocation = useCallback(
        (coords: { lat: number; lng: number }): boolean => {
            const point = [coords.lng, coords.lat]; // Format [lng, lat]

            return pointInPolygon(point, samarindaServiceArea);
        },
        []
    );

    // --- RUN CHECKING WHEN COMPONENT MOUNTED ---
    useEffect(() => {
        checkPermissionStatus();
    }, [checkPermissionStatus]);

    /**
     * This function is called when the "Aktifkan Lokasi" button is clicked.
     * It triggers the browser's native permission prompt.
     */
    const handleActivateLocation = () => {
        navigator.geolocation.getCurrentPosition(
            // Success callback (user clicked "Allow")
            () => {
                // The 'onchange' listener in checkPermissionStatus will handle the state update
                // and close the sheet automatically.
            },
            // Error callback (user clicked "Block")
            () => {
                // The 'onchange' listener will also handle this.
                // The sheet will remain open, and you could show an error message.
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    /**
     * A callback function that updates the component state with the new coordinates
     * whenever the user drags the pin on the map. It also validates the new location
     * by checking if it's within the service area boundary.
     *
     * @param {L.LatLng} latlng - The new latitude and longitude of the pin.
     */
    const handlePositionChange = useCallback(
        (latlng: L.LatLng) => {
            const coords = { lat: latlng.lat, lng: latlng.lng };
            setCoordinates(coords);
            setIsLocationValid(validateLocation(coords));
        },
        [validateLocation]
    );

    useEffect(() => {
        if (!coordinates) {
            return;
        }
        const debounceTimer = setTimeout(() => {
            const fetchAddress = async () => {
                setIsGeocoding(true);
                try {
                    const response = await axios.get(
                        "https://nominatim.openstreetmap.org/reverse",
                        {
                            params: {
                                lat: coordinates.lat,
                                lon: coordinates.lng,
                                format: "json",
                            },
                        }
                    );
                    setAddress(
                        response.data.display_name || "Alamat tidak ditemukan"
                    );
                    setLocationDetails(response.data);
                } catch (error) {
                    toast(
                        error instanceof Error
                            ? error.message
                            : "Gagal mendapatkan alamat",
                        customToastStyle
                    );
                    setAddress("Gagal mendapatkan alamat");
                } finally {
                    setIsGeocoding(false);
                }
            };
            fetchAddress();
        }, 1000);

        return () => clearTimeout(debounceTimer);
    }, [coordinates]);

    /**
     * A callback function for when the user selects a location from the search results.
     * It sets the target position on the map to the selected location.
     * @param {Object} coords - The coordinates of the selected location, in the format { lat: number, lng: number }
     */
    const handleLocationSelect = (coords: { lat: number; lng: number }) => {
        setTargetPosition(new L.LatLng(coords.lat, coords.lng));
    };

    /**
     * A function that handles form submission.
     * It checks if the user has set a valid location and address,
     * and if so, calls the onSubmit function with the correct data.
     * If not, it shows an error toast.
     */
    const handleSubmit = () => {
        // Check if the user has set a valid location
        if (!coordinates) {
            toast("Maaf, Anda belum mengatur lokasi", customToastStyle);
            return;
        }

        // Check if the user has set a valid address
        if (!address) {
            toast("Maaf, Anda belum mengatur alamat", customToastStyle);
            return;
        }

        // Check if the user has set a valid location within the service area
        if (!isLocationValid) {
            toast(
                "Maaf, layanan kami belum sampai di areamu",
                customToastStyle
            );
            return;
        }

        // Call the onSubmit function with the correct data
        onSubmit({
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            note: locationNote,
            address:
                locationDetails?.address.amenity ??
                locationDetails?.address.road ??
                locationDetails?.address.village,
        });
    };

    return (
        <div className="h-screen w-full relative overflow-hidden max-w-lg mx-auto">
            {/* Map Area */}
            <div className="absolute inset-0 z-0">
                {/* Search bar */}
                <div className="absolute top-2 z-50 bg-white rounded-full w-full">
                    <LocationSearch onLocationSelect={handleLocationSelect} />
                </div>
                <LocationPicker
                    initialCoordinates={coordinates ?? undefined}
                    permissionStatus={locationPermission}
                    isLoading={isGeocoding}
                    onPositionChange={handlePositionChange}
                >
                    <MapController targetPosition={targetPosition} />
                    <Polygon
                        positions={samarindaServiceAreaForLeaflet}
                        pathOptions={{
                            color: "green",
                            fillColor: "green",
                            fillOpacity: 0.1,
                        }}
                    />
                </LocationPicker>
            </div>

            {/* 3. Bottom Panel */}
            <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border rounded-t-2xl">
                {/* Back Button */}
                <Fab
                    size="small"
                    // aria-label="add"
                    onClick={onBack}
                    className="absolute -top-15 left-4 z-10 bg-white p-2 rounded-full shadow-md cursor-pointer active:scale-95"
                >
                    <MoveLeft className="text-gray-600" />
                </Fab>

                <div className="p-4">
                    <h2 className="font-semibold text-xl mb-3">
                        Set Lokasi Service
                    </h2>

                    {/* Detail Location */}
                    {!isLocationValid ? (
                        // Show when LOCATION IS NOT VALID
                        <div className="bg-red-100 border border-red-300 p-3 rounded-lg text-center">
                            <h3 className="font-bold text-red-700">
                                Di Luar Area Layanan
                            </h3>
                            <p className="text-sm text-red-600">
                                Maaf, saat ini kami hanya melayani di area
                                Samarinda. Silakan geser pin ke dalam area yang
                                ditandai.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-secondary/15 p-3 rounded-lg flex items-start gap-3">
                            <div className="bg-red-400 p-1 rounded-full flex items-center justify-center text-center">
                                <LocationPinIcon
                                    className="text-white"
                                    fontSize="small"
                                />
                            </div>
                            <div className="flex justify-between w-full">
                                <div>
                                    <h3 className="font-medium text-md mb-1">
                                        {isGeocoding
                                            ? "Mencari..."
                                            : locationDetails?.address
                                                  .amenity ||
                                              locationDetails?.address.road ||
                                              locationDetails?.address
                                                  .village ||
                                              "Lokasi Terpilih"}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {isGeocoding ? "..." : address}
                                    </p>
                                </div>
                                {/* Location Note */}
                                <button
                                    className="bg-none p-1 rounded-full cursor-pointer"
                                    onClick={() => setIsNoteSheetOpen(true)}
                                >
                                    {locationNote.trim().length > 0 ? (
                                        <img
                                            src={noteSucces}
                                            alt="note-filled"
                                            className={`${
                                                isGeocoding
                                                    ? "w-5 lg:w-5"
                                                    : "w-10.5 lg:w-8"
                                            }`}
                                        />
                                    ) : (
                                        <img
                                            src={addNote}
                                            alt="add-note"
                                            className={`${
                                                isGeocoding
                                                    ? "w-5 lg:w-5"
                                                    : "w-10.5 lg:w-8"
                                            }`}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={
                            isGeocoding || !coordinates || !isLocationValid
                        }
                        className="w-full h-12 rounded-full text-[16px] font-semibold mt-4 cursor-pointer active:scale-95 items-center bg-primary text-white capitalize disabled:bg-primary/50 disabled:text-white"
                    >
                        Lanjut
                    </Button>
                </div>
            </div>

            {/* Show Enable Location Sheet */}
            <EnableLocationSheet
                isOpen={isLocationPermissionSheetOpen}
                onOpenChange={setIsLocationPermissionSheetOpen}
                onActivate={handleActivateLocation}
            />

            {/* Show Location Note Sheet */}
            <LocationNoteSheet
                isOpen={isNoteSheetOpen}
                onOpenChange={setIsNoteSheetOpen}
                initialNote={locationNote}
                onSave={(newNote) => setLocationNote(newNote)}
                locationDetails={locationDetails}
                address={address}
            />
        </div>
    );
}
