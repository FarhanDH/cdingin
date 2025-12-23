import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import { customToastStyle } from "~/common/custom-toast-style";
import { Button, CircularProgress } from "@mui/material";
import { Textarea } from "~/components/ui/textarea";

// List of cancellation reasons
const customerCancelReasons = [
    { id: "change_details", label: "Saya ingin mengubah detail pesanan" },
    { id: "wait_too_long", label: "Teknisi tidak kunjung memberi konfirmasi" },
    { id: "accidental_booking", label: "Saya tidak sengaja membuat pesanan" },
    { id: "other_customer", label: "Alasan lainnya" },
];

const technicianCancelReasons = [
    { id: "cannot_contact", label: "Pelanggan tidak bisa dihubungi" },
    { id: "customer_request", label: "Pelanggan meminta untuk dibatalkan" },
    { id: "road_issue", label: "Ada kendala di jalan (ban bocor, dll.)" },
    { id: "weather_issue", label: "Cuacanya hujan deras" },
    { id: "incomplete_tools", label: "Alat tidak lengkap untuk masalah ini" },
    { id: "other_technician", label: "Alasan lainnya" },
];

interface CancelOrderSheetProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onSuccess: () => void;
    actor: "customer" | "technician";
}

export default function CancelOrderSheet({
    isOpen,
    onClose,
    orderId,
    onSuccess,
    actor,
}: Readonly<CancelOrderSheetProps>) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic logic based on 'actor'
    const reasons =
        actor === "customer" ? customerCancelReasons : technicianCancelReasons;
    const apiUrl =
        actor === "customer"
            ? `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`
            : `${
                  import.meta.env.VITE_API_URL
              }/orders/technician/${orderId}/cancel`;

    const handleCancelSubmit = async () => {
        if (!selectedReason) {
            toast("Pilih alasan pembatalan dulu, ya.", customToastStyle);
            return;
        }
        if (selectedReason === "Alasan lainnya" && !customReason.trim()) {
            toast("Isi dulu alasan lainnya, ya.", customToastStyle);
            return;
        }

        setIsSubmitting(true);

        const payload = {
            reason: selectedReason,
            note: selectedReason === "Alasan lainnya" ? customReason : null,
        };

        try {
            await axios.patch(apiUrl, payload, { withCredentials: true });
            if (actor === "technician") {
                toast(
                    "Pesanan ini batal, ya. Gak papa 👍. Masih ada yang lain menunggumu 😊.",
                    customToastStyle
                );
            } else {
                toast("Pesanan berhasil dibatalkan.", customToastStyle);
            }
            onSuccess();
        } catch (error) {
            console.error("Gagal membatalkan pesanan");
            toast("Gagal membatalkan pesanan.", customToastStyle);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto"
                    xIconSize={7}
                >
                    <div className="py-4 pl-4">
                        <SheetHeader>
                            <div className="flex gap-4 text-start items-start justify-start -ml-4">
                                <div className="w-15 h-15 bg-red-500 flex items-center text-3xl justify-center rounded-2xl flex-shrink-0">
                                    🥺
                                </div>
                                <div>
                                    <SheetTitle className="text-xl font-bold">
                                        Yakin mau batalin pesanan ini?
                                    </SheetTitle>
                                    <p className="text-gray-500">
                                        Sayang banget. Kalau gak terpaksa,
                                        jangan dibatalin, ya.
                                    </p>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="space-y-4">
                            <p className="font-semibold text-xl">
                                Kenapa pesanannya dibatalin?
                            </p>
                            <RadioGroup
                                value={selectedReason ?? ""}
                                onValueChange={setSelectedReason}
                            >
                                {reasons.map((reason) => (
                                    <Label
                                        key={reason.id}
                                        htmlFor={reason.id}
                                        className="font-medium text-lg cursor-pointer border-t pt-4 pr-4 justify-between text-gray-900 hover:bg-gray-100"
                                    >
                                        {reason.label}
                                        <RadioGroupItem
                                            value={reason.label}
                                            id={reason.id}
                                            className="flex items-center justify-center size-7"
                                            fillSize={5}
                                        />
                                    </Label>
                                ))}
                            </RadioGroup>
                            {selectedReason === "Alasan lainnya" && (
                                <div className="mt-4 pr-4">
                                    <Textarea
                                        placeholder="Tulis alasan pembatalan di sini..."
                                        value={customReason}
                                        onChange={(e) =>
                                            setCustomReason(e.target.value)
                                        }
                                        className="h-fit text-base"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <SheetFooter className="mt-6 grid grid-cols-2 gap-6">
                        <Button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full h-[48px] normal-case rounded-full font-semibold text-md bg-white border-[1.5px] border-[#006C7F] text-[#006C7F] active:scale-95 cursor-pointer !font-[Rubik] text-base disabled:bg-white/50 disabled:cursor-not-allowed"
                        >
                            Nggak jadi
                        </Button>
                        <Button
                            onClick={handleCancelSubmit}
                            disabled={
                                !selectedReason ||
                                isSubmitting ||
                                (selectedReason === "Alasan lainnya" &&
                                    !customReason.trim())
                            }
                            className="w-full h-[48px] rounded-full font-semibold text-md active:scale-95 cursor-pointer bg-primary text-white normal-case !font-[Rubik] text-base disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <CircularProgress
                                    size={20}
                                    className="text-white"
                                />
                            ) : (
                                "Ya, Batalin"
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
