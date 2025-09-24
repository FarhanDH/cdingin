import NotificationsIcon from "@mui/icons-material/Notifications";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
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
 * A reusable bottom navigation component for the customer section.
 * It automatically highlights the active tab based on the current URL.
 */
export default function CustomerBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("/orders");
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
            className="max-w-lg mx-auto font-[Rubik] border-none"
        >
            <BottomNavigation
                showLabels
                value={activeTab}
                onChange={handleChange}
                className="!border-none shadow-none"
            >
                <BottomNavigationAction
                    className={
                        activeTab === "/orders"
                            ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik] font-medium`
                            : "text-gray-500 font-light"
                    }
                    label="Pesanan"
                    value="/orders"
                    icon={
                        <>
                            <StickyNote2RoundedIcon
                                className={
                                    activeTab === "/orders"
                                        ? `!text-primary `
                                        : "text-gray-500"
                                }
                            />
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/orders"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </>
                    }
                />
                <BottomNavigationAction
                    label="Pemberitahuan"
                    value="/notifications"
                    icon={
                        <>
                            <Badge
                                color="error"
                                badgeContent={unreadCount}
                                max={9}
                                invisible={unreadCount === 0}
                                className="!font-[Rubik]"
                            >
                                <NotificationsIcon
                                    className={
                                        activeTab === "/notifications"
                                            ? `!text-primary `
                                            : "text-gray-500"
                                    }
                                />
                            </Badge>
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/notifications"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </>
                    }
                    className={
                        activeTab === "/notifications"
                            ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik] font-medium`
                            : "text-gray-500 font-light"
                    }
                />
                {/* <BottomNavigationAction
                    label="Profil"
                    value="/profile"
                    icon={
                        <>
                            <PersonIcon
                                className={
                                    activeTab === "/profile"
                                        ? `!text-primary `
                                        : "text-gray-500"
                                }
                            />
                            <div
                                className={`w-full h-1 rounded-b-3xl absolute top-0 left-0 ${
                                    activeTab === "/profile"
                                        ? "bg-primary"
                                        : "bg-transparent"
                                }`}
                            ></div>
                        </>
                    }
                    className={
                        activeTab === "/profile"
                            ? `!text-primary !bg-gradient-to-b from-secondary/10 to-secondary/0 !font-[Rubik] font-medium`
                            : "text-gray-500 font-light"
                    }
                /> */}
            </BottomNavigation>
        </Paper>
    );
}
