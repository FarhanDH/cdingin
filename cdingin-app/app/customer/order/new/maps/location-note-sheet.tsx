import { useEffect, useState } from "react";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import { Input } from "~/components/ui/input";
import { Button } from "@mui/material";

interface LocationNoteSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialNote: string;
    onSave: (note: string) => void;
    locationDetails: any; // Pass location details for display
    address: string;
}
/**
A bottom sheet for adding or editing a location-specific note.
It uses a temporary state to handle changes, which are only committed on save.
*/
export default function LocationNoteSheet({
    isOpen,
    onOpenChange,
    initialNote,
    onSave,
    locationDetails,
    address,
}: Readonly<LocationNoteSheetProps>) {
    // 1. Use a temporary state for the input field.
    const [tempNote, setTempNote] = useState(initialNote);
    // 2. Sync tempNote with initialNote ONLY when the sheet opens.
    useEffect(() => {
        if (isOpen) {
            setTempNote(initialNote);
        }
    }, [isOpen, initialNote]);
    // 3. Handle the save action.
    const handleSave = () => {
        onSave(tempNote); // Commit the temporary state to the parent component.
        onOpenChange(false); // Close the sheet.
    };
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="rounded-t-2xl max-w-lg mx-auto"
            >
                <SheetHeader className="text-left space-y-4">
                    <SheetTitle className="text-xl font-bold">
                        Catatan buat teknisi
                    </SheetTitle>
                    {/* Display location details  */}
                    <div className="bg-secondary/15 p-3 rounded-lg flex items-start gap-3">
                        <div className="bg-red-400 p-1 rounded-full flex items-center justify-center text-center">
                            <LocationPinIcon
                                className="text-white"
                                fontSize="small"
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-md">
                                {locationDetails?.address.amenity ||
                                    locationDetails?.address.road ||
                                    locationDetails?.address.village ||
                                    "Lokasi Terpilih"}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {address}
                            </p>
                        </div>
                    </div>
                    {/* Input Field */}
                    <div>
                        <Input
                            autoComplete="off"
                            id="locationNote"
                            type="text"
                            name="locationNote"
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Cth: Rumah pagar hijau, no. 10 paling ujung"
                            maxLength={255}
                            className="h-12 text-md"
                        />
                    </div>
                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        className="w-full h-12 rounded-full text-base font-semibold bg-primary text-white normal-case active:scale-95"
                    >
                        Lanjut
                    </Button>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
