import { Button } from "@mui/material";
import locationIllustration from "~/assets/location-illustration.png";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import { useAuth } from "~/contexts/auth.context";

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
    const user = useAuth();

    const userRole = user.user?.role;

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
                        Aktifkan layanan lokasi HP
                    </SheetTitle>
                    <SheetDescription className="text-[16px] text-gray-600">
                        {userRole === "customer"
                            ? "Biar teknisi lebih gampang mastiin posisi servicenya, dan lebih cepat sampai ke lokasi."
                            : "Dengan lokasi aktif, kamu bisa lebih mudah menemukan lokasi pelanggan."}
                    </SheetDescription>
                    <Button
                        onClick={onActivate}
                        className="w-full h-12 rounded-full text-md font-medium mt-6 bg-primary text-white active:scale-95 !font-[Rubik] normal-case text-base"
                    >
                        Aktifin Lokasi
                    </Button>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
