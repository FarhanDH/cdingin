import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import notificationIcon from "public/notification-ilustration.png";
import { Button } from "@mui/material";

interface NotificationPermissionSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

/**
 * A reusable bottom sheet to prime the user before requesting notification permission.
 */
export default function NotificationPermissionSheet({
    isOpen,
    onOpenChange,
    onConfirm,
    title,
    description,
}: Readonly<NotificationPermissionSheetProps>) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl py-4 px-2 max-w-lg mx-auto text-center"
            >
                <SheetHeader>
                    <img
                        src={notificationIcon}
                        alt="Ikon Notifikasi"
                        className="w-full mx-auto mb-4 rounded-4xl"
                    />
                    <SheetTitle className="text-xl font-bold">
                        {title}
                    </SheetTitle>
                    <SheetDescription className="text-md text-gray-600">
                        {description}
                    </SheetDescription>
                </SheetHeader>
                <Button
                    onClick={onConfirm}
                    className="w-full h-12 rounded-full text-[16px] font-semibold bg-primary normal-case text-white active:scale-95"
                >
                    Oke, izinkan
                </Button>
                {/* <div className="mt-6"></div> */}
            </SheetContent>
        </Sheet>
    );
}
