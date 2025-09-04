import { Outlet } from "react-router";
import CustomerBottomNav from "~/components/customer/customer-bottom-nav";

export default function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="pb-16">
            {/* Konten utama aplikasi */}
            <main className="max-w-lg mx-auto w-full">
                <Outlet />

                <CustomerBottomNav />
            </main>
        </div>
    );
}
