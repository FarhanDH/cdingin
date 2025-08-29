import { Button } from "~/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
// import pwaIcon from "~/assets/pwa-install-icon.png";

interface InstallPwaSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onInstall: () => void; // Function to trigger installation prompt
}

/**
 * A bottom sheet component that prompts the user to install the PWA.
 */
export default function InstallPwaSheet({
    isOpen,
    onClose,
    onInstall,
}: Readonly<InstallPwaSheetProps>) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl max-w-lg mx-auto p-6 text-center"
            >
                <SheetHeader>
                    {/* <img
                        src={pwaIcon}
                        alt="Instal Aplikasi Cdingin"
                        className="w-24 mx-auto mb-4"
                    /> */}
                    <SheetTitle className="text-xl font-bold">
                        Pasang cdingin di HP-mu!
                    </SheetTitle>
                    <SheetDescription className="text-md text-gray-600">
                        Dapetin akses lebih cepat, langsung dari layar utama.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                    <Button
                        onClick={onInstall}
                        className="w-full h-12 rounded-full text-md font-semibold bg-primary text-white"
                    >
                        Ya, Install Aplikasi
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full h-12 rounded-full text-md font-semibold text-gray-600"
                    >
                        Lain Kali Aja
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
