import PersonIcon from "@mui/icons-material/Person";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { CircularProgress, Fab } from "@mui/material";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import mapPin from "public/map-pin.png";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    Tooltip,
} from "react-leaflet";
import { useNavigate } from "react-router";
import { formattedDate } from "~/common/utils";
import { blueDotIcon } from "~/customer/order/new/maps/current-location-marker";
import ZoomControl from "~/customer/order/new/maps/zoom-control";
import { useRouteCalculator } from "~/hooks/use-route-calculator";
import { useTechnicianLocation } from "~/hooks/use-technician-location";
import type { OrderItem } from "~/types/order.types";
import type { Route } from "./+types/map";

function RouteLine({
    start,
    end,
}: Readonly<{ start: L.LatLng | null; end: L.LatLng }>) {
    const { route } = useRouteCalculator(start, end);

    if (route.length === 0) return null;

    return <Polyline positions={route} color="#057895" weight={5} />;
}

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Peta Pesanan | Cdingin" },
        { name: "description", content: "Peta pesanan hari ini." },
    ];
}

/**
 * TechnicianMapPage is a component that displays a map with the technician's current location and the locations of their orders for the day.
 * It fetches the orders from the API and stores them in the state.
 * It also provides a method to request an update of the technician's location.
 * The component is protected by authentication and will redirect to the login page if the user is not authenticated.
 */
export default function TechnicianMapPage() {
    // Stores the list of orders to be displayed on the map
    const [orders, setOrders] = useState<OrderItem[]>([]);
    // Stores whether the orders are being loaded
    const [isLoading, setIsLoading] = useState(true);
    // Navigates to the specified route
    const navigate = useNavigate();
    // Retrieves the technician's current location and provides a method to request an update
    const {
        position: technicianPosition,
        requestLocation,
        startWatching,
        stopWatching,
    } = useTechnicianLocation();
    // Stores the map instance
    const mapRef = useRef<L.Map>(null);

    // Defines the icon to be used for the technician's location
    const mapPinIcon = L.icon({
        iconUrl: mapPin,
        iconSize: [25, 41],
    });

    // Fetches the orders from the API and stores them in the state
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/orders/technician`,
                {
                    params: { "service-date": "today" },
                    withCredentials: true,
                }
            );
            setOrders(response.data.data);
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        startWatching();
        return () => {
            stopWatching();
        };
    }, [startWatching, stopWatching]);

    useEffect(() => {
        // Fetches the orders when the component mounts
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        // Updates the map bounds when the orders or technician position changes
        if (!mapRef.current || orders.length === 0 || !technicianPosition)
            return;

        const markers = orders.map((order) =>
            L.latLng(
                order.serviceLocation.latitude,
                order.serviceLocation.longitude
            )
        );

        markers.push(technicianPosition);

        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [orders, technicianPosition]);

    if (isLoading) {
        // Displays a loading indicator while the orders are being fetched
        return (
            <div className="flex flex-col h-screen items-center justify-center">
                <CircularProgress size={30} className="text-primary" />
                <p className="text-gray-500 mt-2">Memuat peta pesanan...</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="bg-none absolute px-4 top-4 left-0 right-0">
                <Fab
                    className="border border-white bg-primary shrink-0 active:scale-95 disabled:cursor-not-allowed w-12 h-12 normal-case rounded-full !font-[Rubik] font-semibold text-primary"
                    size="medium"
                    onClick={() => navigate("/technician/profile")}
                >
                    <PersonIcon className="text-white" />
                </Fab>
                <div className="flex items-center justify-center -mt-12">
                    <Fab
                        className="disabled:cursor-not-allowed bg-white shadow-lg shrink-0 w-50 h-12 normal-case rounded-full !font-[Rubik] font-semibold text-primary"
                        size="medium"
                        disabled
                    >
                        <p className="text-sm text-gray-700 w-full">
                            {formattedDate(new Date(), { withTime: false })}
                        </p>
                    </Fab>
                </div>
                <Fab
                    className="border border-primary bg-white shrink-0 active:scale-95 disabled:cursor-not-allowed w-12 h-12 normal-case rounded-full !font-[Rubik] font-semibold text-primary absolute -top-0 right-4"
                    size="medium"
                    onClick={() => {
                        fetchOrders();
                        requestLocation();
                    }}
                >
                    <RefreshRoundedIcon className="text-primary" />
                </Fab>
            </div>

            {/* Map */}
            <div className="w-full">
                <MapContainer
                    ref={mapRef}
                    center={[-0.49, 117.15]} // Default Samarinda
                    zoom={12}
                    style={{ height: "93vh", width: "100%" }}
                    preferCanvas={true}
                    className="z-0"
                    zoomAnimation={true}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl onPositionChange={() => {}} />
                    {/* Technician location marker */}
                    {technicianPosition && (
                        <Marker
                            position={technicianPosition}
                            icon={blueDotIcon}
                        >
                            <Popup>Lokasi Anda</Popup>
                        </Marker>
                    )}
                    {/* Service location marker */}
                    {orders.map((order) => {
                        const serviceLocation = L.latLng(
                            order.serviceLocation.latitude,
                            order.serviceLocation.longitude
                        );
                        return (
                            <React.Fragment key={order.id}>
                                <Marker
                                    position={serviceLocation}
                                    icon={mapPinIcon}
                                    eventHandlers={{
                                        click: () => {
                                            navigate(
                                                `/technician/order/${order.id}`
                                            );
                                        },
                                    }}
                                >
                                    <Tooltip
                                        interactive
                                        permanent
                                        direction="top"
                                        offset={[0, -20]}
                                        eventHandlers={{
                                            click: () => {
                                                navigate(
                                                    `/technician/order/${order.id}`
                                                );
                                            },
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="p-1 text-center cursor-pointer">
                                            <p className="font-bold text-xs">
                                                {`${order.customer.fullName} - ${order.totalUnits} unit`}
                                            </p>{" "}
                                            <p className="text-xs line-clamp-1">
                                                {`${
                                                    order?.serviceLocation
                                                        .address.address
                                                        ?.road ||
                                                    order?.serviceLocation
                                                        .address.address
                                                        ?.amenity ||
                                                    order?.serviceLocation
                                                        .address.address
                                                        ?.village
                                                }`}
                                            </p>
                                        </div>
                                    </Tooltip>
                                </Marker>
                                {technicianPosition && (
                                    <RouteLine
                                        start={technicianPosition}
                                        end={serviceLocation}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
