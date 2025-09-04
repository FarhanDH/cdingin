import NotificationCard from "~/components/notification/notification-card";
import type { Route } from "./+types/notification";
import Header from "~/components/header";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pemberitahuan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}
export default function NotificationPage() {
    return (
        <div>
            <Header title="Pemberitahuan" isSticky showBorder />
            <NotificationCard
                id="1"
                title="🎉 Yeay! Service Udah Selesai"
                body="Servis AC sudah selesai. Semoga dinginnya tahan lama~ ❄️"
                createdAt="2025-08-24 19:19:29.685406+08"
                isRead={false}
                key={1}
            />
            <NotificationCard
                id="1"
                title="🎉 Yeay!"
                body="Servis AC sudah selesai. Semoga dinginnya tahan lama~ ❄️"
                createdAt="2025-08-24 19:19:29.685406+08"
                isRead={false}
                key={1}
            />
            <NotificationCard
                id="1"
                title="🎉 Yeay! Service Udah Selesai"
                body="Servis AC sudah selesai. Semoga dinginnya tahan lama~ ❄️"
                createdAt="2025-08-24 19:19:29.685406+08"
                isRead={true}
                key={1}
            />
        </div>
    );
}
