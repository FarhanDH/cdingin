import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "~/components/header";
import NotificationCard from "~/components/notification/notification-card";
import Spinner from "~/components/ui/spinner";
import type { NotificationItem } from "~/types/notification.types";
import type { Route } from "./+types/notification";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pemberitahuan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}
export default function NotificationPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/notifications`,
                    {
                        withCredentials: true,
                    }
                );

                setNotifications(response.data.data);
            } catch (error) {
                console.error(`Gagal mengambil notifikasi: `, error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div>
            {isLoading && (
                <div
                    className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
                        isLoading ? "bg-black/50" : ""
                    }`}
                >
                    <Dialog open={isLoading} modal>
                        <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                            <DialogTitle></DialogTitle>
                            <DialogDescription></DialogDescription>
                            <Spinner size={30} className="text-primary" />
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <Header
                title="Pemberitahuan"
                isSticky
                showBorder
                showProfile
                className="bg-white"
            />

            {notifications.length === 0 ? (
                <div className="mt-10 items-center w-full mb-auto flex flex-col text-center p-4">
                    <h1 className="font-semibold text-lg">
                        Belum ada pemberitahuan
                    </h1>
                </div>
            ) : (
                notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                    />
                ))
            )}
        </div>
    );
}
