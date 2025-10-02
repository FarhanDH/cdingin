import PersonIcon from "@mui/icons-material/Person";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import {
    Circle,
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    Tooltip,
} from "react-leaflet";
import { useNavigate } from "react-router";
import mapPin from "~/assets/map-pin.png";
import motorcycle from "~/assets/motorcycle.png";
import ZoomControl from "~/customer/order/new/maps/zoom-control";
import { useRouteCalculator } from "~/hooks/use-route-calculator";
import { useTechnicianLocation } from "~/hooks/use-technician-location";
import type { OrderItem } from "~/types/order.types";
import type { Route } from "./+types/map";
import { ChevronRight } from "lucide-react";

function RouteLine({ start, end }: { start: L.LatLng | null; end: L.LatLng }) {
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

export default function TechnicianMapPage() {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { position: technicianPosition } = useTechnicianLocation({
        fetchOnMount: true,
    });
    const mapRef = useRef<L.Map>(null);

    const mapPinIcon = L.icon({
        iconUrl: mapPin,
        iconSize: [25, 41],
    });

    const motorcycleIcon = L.icon({
        iconUrl: motorcycle,
        iconSize: [30, 50],
    });

    useEffect(() => {
        const fetchOrders = async () => {
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
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    useEffect(() => {
        if (!mapRef.current || orders.length === 0) return;

        const markers = orders.map((order) =>
            L.latLng(
                order.serviceLocation.latitude,
                order.serviceLocation.longitude
            )
        );

        if (technicianPosition) {
            markers.push(technicianPosition);
        }

        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [orders, technicianPosition]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center">
                <CircularProgress size={30} className="text-primary" />
                <p className="text-gray-500 mt-2">Memuat peta pesanan...</p>
            </div>
        );
    }

    return (
        <div>
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
                        <>
                            <Marker
                                position={technicianPosition}
                                icon={motorcycleIcon}
                            >
                                <Popup>Lokasi Kamu</Popup>
                            </Marker>
                        </>
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
                                        className="cursor-pointer active:scale-95"
                                    >
                                        <div className="p-1 text-center cursor-pointer">
                                            <p className="font-bold">
                                                {`${order.customer.fullName} - ${order.totalUnits} unit`}
                                            </p>
                                            <p className="text-xs line-clamp-1">
                                                {`${order.serviceLocation.address.address.road}`}
                                            </p>
                                            <p className="text-xs line-clamp-1 flex items-center justify-center">
                                                {`Lihat detail `}{" "}
                                                <ChevronRight size={15} />
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
