import { WifiOff } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";

interface OfflineSheetProps {
    isOpen: boolean;
}

/**
 * A bottom sheet component that informs the user they are offline.
 */
export default function OfflineSheet({ isOpen }: Readonly<OfflineSheetProps>) {
    return (
        <Sheet open={isOpen}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl max-w-lg mx-auto p-6 text-center"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                // hideCloseButton={true}
            >
                <SheetHeader>
                    <WifiOff className="w-16 h-16 mx-auto mb-4 text-destructive" />
                    <SheetTitle className="text-xl font-bold">
                        Sepertinya Jaringanmu Mati
                    </SheetTitle>
                    <SheetDescription className="text-md text-gray-600">
                        Coba periksa koneksi Wi-Fi atau data selulermu. Aplikasi
                        akan berfungsi kembali setelah kamu terhubung ke
                        internet.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
