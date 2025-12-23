import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Fab } from "@mui/material";
import { LocateFixed } from "lucide-react";
import { useMap } from "react-leaflet";

/**
 * A custom zoom control component for the Leaflet map.
 * It uses Material-UI's Fab (Floating Action Button) for a modern look and feel.
 * This component must be used as a child of a react-leaflet `MapContainer`.
 */
export interface ZoomControlProps {
    /**
     * A callback function to be called when the user's position changes.
     * The callback receives the new position as a Leaflet LatLng object.
     */
    onPositionChange: (position: L.LatLng) => void;
}

export default function ZoomControl({
    onPositionChange,
}: Readonly<ZoomControlProps>) {
    // Get the Leaflet map instance from the react-leaflet context.
    const map = useMap();

    /**
     * Handles the zoom in action.
     * Calls the `zoomIn` method on the map instance.
     */
    const handleZoomIn = () => {
        map.zoomIn();
    };

    /**
     * Handles the zoom out action.
     * Calls the `zoomOut` method on the map instance.
     */
    const handleZoomOut = () => {
        map.zoomOut();
    };

    const handleCurrentLocation = () => {
        map.locate().on("locationfound", (e) => {
            map.flyTo(e.latlng, 18);
            onPositionChange(e.latlng);
        });
    };

    return (
        // This container will position the zoom controls on the map.
        // It's placed on the right side and uses flexbox to stack the buttons vertically.
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[1000] flex flex-col gap-2">
            {/* Zoom In Button */}
            <Fab
                size="small"
                aria-label="zoom in"
                onClick={handleZoomIn}
                sx={{
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                }}
            >
                <AddIcon className="text-gray-600" />
            </Fab>

            {/* Zoom Out Button */}
            <Fab
                size="small"
                aria-label="zoom out"
                onClick={handleZoomOut}
                sx={{
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                }}
            >
                <RemoveIcon className="text-gray-600" />
            </Fab>

            {/* Current Location Button */}
            <Fab
                size="small"
                aria-label="locate fixed"
                onClick={handleCurrentLocation}
                sx={{
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                }}
            >
                <LocateFixed className="text-gray-600" />{" "}
            </Fab>
        </div>
    );
}
