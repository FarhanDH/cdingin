import NotificationsIcon from "@mui/icons-material/Notifications";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import {
    Badge,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

/**
 * A reusable bottom navigation component for the technician section.
 * It automatically highlights the active tab based on the current URL.
 */
export default function TechnicianBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("/technician/orders");
    const [unreadCount, setUnreadCount] = useState(0);

    // Effect to sync the active tab with the current URL path.
    // This ensures the correct tab is highlighted if the user navigates directly
    // to a URL or uses the browser's back/forward buttons.
    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_API_URL
                    }/notifications/unread-count`,
                    { withCredentials: true }
                );

                setUnreadCount(response.data.data.unreadCount);
            } catch (error) {
                console.error("Gagal mengambil jumlah notifikasi:", error);
            }
        };

        fetchUnreadCount();
    }, [activeTab]);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    return (
        <Paper
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}
            elevation={3}
            className="max-w-lg mx-auto !font-[Rubik] border-none h-15"
        >
            <BottomNavigation
                showLabels
                value={activeTab}
                onChange={handleChange}
                className="!border-none shadow-none"
            >
                {/* Order */}
                <BottomNavigationAction
                    className={`
                       ${
                           activeTab === "/technician/orders"
                               ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik]`
                               : "text-gray-500"
                       }`}
                    value="/technician/orders"
                    icon={
                        <div className="text-center flex flex-col items-center">
                            <StickyNote2RoundedIcon
                                className={`mb-1 mt-2 transition-all duration-300
                                    ${
                                        activeTab === "/technician/orders"
                                            ? `!text-primary transform scale-110 `
                                            : "text-gray-500"
                                    }`}
                            />
                            <p
                                className={`text-xs transition-all duration-300 ${
                                    activeTab === "/technician/orders"
                                        ? "text-primary font-medium text-sm"
                                        : "text-gray-600 font-light"
                                } `}
                            >
                                Pesanan
                            </p>
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/technician/orders"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </div>
                    }
                />
                {/* Income */}
                <BottomNavigationAction
                    value="/technician/earnings"
                    className={
                        activeTab === "/technician/earnings"
                            ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik] font-medium`
                            : "text-gray-500 font-light"
                    }
                    icon={
                        <>
                            <WalletRoundedIcon
                                className={`mb-1 mt-2 transition-all duration-300 
                                    ${
                                        activeTab === "/technician/earnings"
                                            ? `!text-primary transform scale-110`
                                            : "text-gray-500"
                                    }`}
                            />
                            <p
                                className={`text-xs transition-all duration-300 ${
                                    activeTab === "/technician/earnings"
                                        ? "text-primary font-medium text-sm"
                                        : "text-gray-600 font-light"
                                } `}
                            >
                                Pendapatan
                            </p>
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/technician/earnings"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </>
                    }
                />
                {/* Notification */}
                <BottomNavigationAction
                    value="/technician/notifications"
                    icon={
                        <>
                            <Badge
                                color="error"
                                badgeContent={unreadCount}
                                max={9}
                                invisible={unreadCount === 0}
                                className="!font-[Rubik] mb-1 mt-2 "
                            >
                                <NotificationsIcon
                                    className={`mb-1 mt-1 transition-all duration-300 ${
                                        activeTab ===
                                        "/technician/notifications"
                                            ? `!text-primary transform scale-110`
                                            : "text-gray-500"
                                    }`}
                                />
                            </Badge>
                            <p
                                className={`text-xs transition-all duration-300 ${
                                    activeTab === "/technician/notifications"
                                        ? "text-primary font-medium text-base"
                                        : "text-gray-600 font-light"
                                } `}
                            >
                                Pemberitahuan
                            </p>
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/technician/notifications"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </>
                    }
                    className={
                        activeTab === "/technician/notifications"
                            ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik] font-medium`
                            : "text-gray-500 font-light"
                    }
                />
            </BottomNavigation>
        </Paper>
    );
}
