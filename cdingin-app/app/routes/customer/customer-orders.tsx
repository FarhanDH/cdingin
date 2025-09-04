import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Bell, ListOrdered, PersonStanding } from "lucide-react";
import { useEffect } from "react";
import InstallPwaSheet from "~/components/install-pwa-sheet";
import CustomerOrderList from "~/customer/order/order-list";
import { usePwaInstall } from "~/hooks/use-pwa-install";
import type { Route } from "./+types/customer-orders";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Daftar pesanan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function CustomerOrders() {
    const {
        isSheetOpen,
        showInstallSheet,
        closeInstallSheet,
        triggerInstallPrompt,
        canInstall,
    } = usePwaInstall();

    useEffect(() => {
        if (canInstall) {
            setTimeout(() => {
                showInstallSheet();
            }, 1500);
        }
    }, [showInstallSheet]);
    return (
        <Box sx={{ pb: 7 }}>
            <CustomerOrderList />
            <Paper
                sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
                elevation={3}
                className="max-w-lg mx-auto "
            >
                <BottomNavigation
                    showLabels
                    className="border-2"
                    // value={value}
                    // onChange={(event, newValue) => {
                    //   setValue(newValue);
                    // }}
                >
                    <BottomNavigationAction
                        label="Pesanan"
                        icon={<ListOrdered />}
                        href="/orders"
                    />
                    <BottomNavigationAction
                        label="Pemberitahuan"
                        icon={<Bell />}
                        href="/notifications"
                    />
                    <BottomNavigationAction
                        label="Profil"
                        icon={<PersonStanding />}
                    />
                </BottomNavigation>
            </Paper>

            {/* Pwa Prompt Sheet */}
            <InstallPwaSheet
                isOpen={isSheetOpen}
                onClose={closeInstallSheet}
                onInstall={triggerInstallPrompt}
            />
        </Box>
    );
}
