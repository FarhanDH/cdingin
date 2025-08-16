import L from "leaflet";
import { Circle, Marker } from "react-leaflet";

const blueDotIcon = new L.DivIcon({
    className: "leaflet-blue-dot-icon",
    iconSize: [20, 20], // The size of the icon
});

interface CurrentLocationMarkerProps {
    position: L.LatLng;
    accuracy: number;
}

/**
 * This component ONLY displays the user's current location marker and accuracy circle.
 * It receives the position and accuracy as props.
 */
export default function CurrentLocationMarker({
    position,
    accuracy,
}: Readonly<CurrentLocationMarkerProps>) {
    // Render the accuracy circle and the blue dot marker.
    return (
        <>
            <Circle
                center={position}
                radius={accuracy}
                // radius={15}
                pathOptions={{
                    color: "#1d4ed8",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.2,
                    weight: 1,
                }}
            />
            <Marker position={position} icon={blueDotIcon} />
        </>
    );
}
