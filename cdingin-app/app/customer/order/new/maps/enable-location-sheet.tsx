import { Button } from "@mui/material";
import locationIllustration from "~/assets/location-illustration.png";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";

interface EnableLocationSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onActivate: () => void; // Function to trigger location permission request
}

/**
 * A bottom sheet component that prompts the user to enable location services.
 * It's displayed when the location permission is not yet granted.
 */
export default function EnableLocationSheet({
    isOpen,
    onOpenChange,
    onActivate,
}: Readonly<EnableLocationSheetProps>) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl max-w-lg mx-auto text-center"
                // Prevent close sheet beyond interaction
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <SheetHeader className="">
                    <img
                        src={locationIllustration}
                        alt="Ilustrasi Peta"
                        className="w-full mx-auto mb-4"
                    />
                    <SheetTitle className="text-xl font-bold">
                        Aktifkan layanan lokasi HP-mu
                    </SheetTitle>
                    <SheetDescription className="text-md text-gray-600">
                        Biar teknisi lebih gampang mastiin posisi servicenya,
                        dan lebih cepat sampai ke lokasimu.
                    </SheetDescription>
                    <Button
                        onClick={onActivate}
                        className="w-full h-12 rounded-full text-md font-semibold mt-6 bg-primary text-white active:scale-95"
                    >
                        Aktifkan Lokasi
                    </Button>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
