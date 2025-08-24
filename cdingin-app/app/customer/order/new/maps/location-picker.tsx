import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import markerIcon from "~/assets/map-pin.png";
import ZoomControl from "./zoom-control";
import CurrentLocationMarker from "./current-location-marker";
import { toast } from "sonner";
import { customToastStyle } from "~/routes/technician/technician-order-detail";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const tileLayerUrl = import.meta.env.VITE_TILE_LAYER_MAP_URL;

const attributionMap = import.meta.env.VITE_ATTRIBUTION_MAP;

interface MapEventHandlerProps {
    onPositionChange: (position: L.LatLng) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    permissionStatus: "granted" | "denied" | "prompt";
    onLocationFound: (latlng: L.LatLng, accuracy: number) => void;
    initialCoordinates?: { lat: number; lng: number };
}

function MapEventHandler({
    onPositionChange,
    onDragStart,
    onDragEnd,
    permissionStatus,
    onLocationFound,
    initialCoordinates,
}: Readonly<MapEventHandlerProps>) {
    const map = useMap();

    useEffect(() => {
        if (initialCoordinates) {
            map.flyTo(initialCoordinates, 18);
            onPositionChange(
                new L.LatLng(initialCoordinates.lat, initialCoordinates.lng),
            );
        } else if (permissionStatus === "granted") {
            map.locate();
        }
    }, [map, permissionStatus]);

    useMapEvents({
        dragstart() {
            onPositionChange(map.getCenter());
            onDragStart();
        },
        dragend() {
            onPositionChange(map.getCenter());
            onDragEnd();
        },
        zoomend() {
            onPositionChange(map.getCenter());
        },
        locationfound(e) {
            onLocationFound(e.latlng, e.accuracy);
            map.flyTo(e.latlng, 18);
        },
        locationerror() {
            toast("Tidak bisa mendapatkan lokasi.", customToastStyle);
            console.error("Tidak bisa mendapatkan lokasi.");
        },
    });

    return null;
}

export interface LocationPickerProps {
    initialCoordinates?: { lat: number; lng: number };
    permissionStatus: "granted" | "denied" | "prompt";
    children?: React.ReactNode;
    onPositionChange: (position: L.LatLng) => void;
    isLoading: boolean;
}

/**
 * A map component that allows users to select a location.
 * It displays a map from Stadia Alidade Smooth and a blue dot marker
 * that indicates the user's current location.
 * The component also provides a zoom control and a custom pin marker.
 * @param {Object} props
 * @param {Object} [props.initialCoordinates] - Initial coordinates for the map
 * @param {String} props.permissionStatus - Status of the geolocation permission
 * @param {Function} props.onPositionChange - Callback for when the user changes the location
 * @param {Boolean} props.isLoading - Whether the map is currently loading
 * @param {React.ReactNode} [props.children] - Additional children components that will be rendered inside the map container
 */
export default function LocationPicker({
    initialCoordinates,
    permissionStatus,
    onPositionChange,
    isLoading,
    children,
}: Readonly<LocationPickerProps>) {
    const [isDragging, setIsDragging] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<{
        latlng: L.LatLng;
        accuracy: number;
    } | null>(null);

    const mapCenter = initialCoordinates
        ? [initialCoordinates.lat, initialCoordinates.lng]
        : [-0.53, 117.12];

    /**
     * Handle the map's drag events.
     * If the user starts dragging, set isDragging to true.
     * If the user ends dragging, set isDragging to false.
     */
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    return (
        // Use div wrapper for positioning
        <div className="w-ful">
            <MapContainer
                center={mapCenter as LatLngExpression} // Default Polnes
                zoom={18}
                style={{ height: "700px", width: "100%" }}
                preferCanvas={true}
                className="z-0"
                zoomAnimation={true}
                zoomControl={false}
                dragging={!isDragging}
            >
                <TileLayer
                    attribution={attributionMap}
                    url={tileLayerUrl}
                    className="absolute -top-10 left-0 right-0 mx-auto"
                />
                {children}
                <MapEventHandler
                    onPositionChange={onPositionChange}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    permissionStatus={permissionStatus}
                    onLocationFound={(latlng: L.LatLng, accuracy: number) => {
                        setCurrentPosition({ latlng, accuracy });
                    }}
                    initialCoordinates={initialCoordinates}
                />
                <ZoomControl onPositionChange={onPositionChange} />
                {/* Show user marker location, ONLY if founded */}
                {currentPosition && (
                    <CurrentLocationMarker
                        position={currentPosition.latlng}
                        accuracy={currentPosition.accuracy}
                    />
                )}
            </MapContainer>

            {/* Custom pin marker */}
            <div className="absolute top-82 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <img
                    src={markerIcon}
                    alt="Location Pin"
                    className={`w-7 h-12 transition-transform duration-200 ease-out ${
                        isDragging || isLoading
                            ? "-translate-y-0.5 animate-bounce"
                            : "translate-y-0 animate-none"
                    }`}
                />
            </div>
        </div>
    );
}
