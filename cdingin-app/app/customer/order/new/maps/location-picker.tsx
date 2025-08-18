import L from "leaflet";
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

// URL untuk tile layer Stadia Alidade Smooth
const tileLayerUrl = import.meta.env.VITE_TILE_LAYER_MAP_URL;

// Atribusi yang diperlukan oleh Stadia Maps
const stadiaAttribution = import.meta.env.VITE_STADIA_ATTRIBUTION_MAP;

interface MapEventHandlerProps {
    onPositionChange: (position: L.LatLng) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    permissionStatus: "granted" | "denied" | "prompt";
    onLocationFound: (latlng: L.LatLng, accuracy: number) => void;
}

function MapEventHandler({
    onPositionChange,
    onDragStart,
    onDragEnd,
    permissionStatus,
    onLocationFound,
}: Readonly<MapEventHandlerProps>) {
    const map = useMap();

    useEffect(() => {
        if (permissionStatus === "granted") {
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
    permissionStatus: "granted" | "denied" | "prompt";
    onPositionChange: (position: L.LatLng) => void;
    isLoading: boolean;
}

export default function LocationPicker({
    permissionStatus,
    onPositionChange,
    isLoading,
}: Readonly<LocationPickerProps>) {
    const [isDragging, setIsDragging] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<{
        latlng: L.LatLng;
        accuracy: number;
    } | null>(null);

    return (
        // 2. Gunakan div wrapper untuk positioning
        <div className="w-ful">
            <MapContainer
                center={[-0.53, 117.12]} // Default Polnes
                zoom={18}
                style={{ height: "700px", width: "100%" }}
                preferCanvas={true}
                className="z-0"
                zoomAnimation={true}
                zoomControl={false}
                dragging={!isDragging}
            >
                <TileLayer
                    attribution={stadiaAttribution}
                    url={tileLayerUrl}
                    // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="absolute -top-10 left-0 right-0 mx-auto"
                />
                <MapEventHandler
                    onPositionChange={onPositionChange}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    permissionStatus={permissionStatus}
                    onLocationFound={(latlng: L.LatLng, accuracy: number) => {
                        setCurrentPosition({ latlng, accuracy });
                    }}
                />
                <ZoomControl onPositionChange={onPositionChange} />
                {/* Show marker location user, ONLY if founded */}
                {currentPosition && (
                    <CurrentLocationMarker
                        position={currentPosition.latlng}
                        accuracy={currentPosition.accuracy}
                    />
                )}{" "}
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
