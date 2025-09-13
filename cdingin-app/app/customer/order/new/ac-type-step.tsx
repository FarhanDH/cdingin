import {
    Button,
    DialogActions,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import Header from "~/components/header";
import type { AcUnitDetail } from "~/types/order.types";
import AcUnitCard from "./ac-unit-card";

interface AcTypeStepProps {
    initialAcUnits: AcUnitDetail[];
    onSubmit: (data: { acUnits: AcUnitDetail[] }) => void;
    onBack: () => void;
}

export default function AcTypeStep({
    initialAcUnits,
    onSubmit,
    onBack,
}: Readonly<AcTypeStepProps>) {
    const [acUnits, setAcUnits] = useState<AcUnitDetail[]>(
        initialAcUnits.length > 0 ? initialAcUnits : []
    );
    const [isTotalUnitLimitAlertOpen, setIsTotalUnitLimitAlertOpen] =
        useState(false);

    const calculateTotalQuantity = (units: AcUnitDetail[]) => {
        return units.reduce((acc, unit) => acc + unit.quantity, 0);
    };

    const handleAddUnit = () => {
        const totalQuantity = calculateTotalQuantity(acUnits);
        if (totalQuantity >= 10) {
            setIsTotalUnitLimitAlertOpen(true);
            return;
        }

        setAcUnits([
            ...acUnits,
            {
                id: Math.random().toString(36),
                acType: null,
                pk: "",
                brand: "",
                quantity: 1,
            },
        ]);
    };

    const handleRemoveUnit = (id: string) => {
        setAcUnits(acUnits.filter((unit) => unit.id !== id));
    };

    const handleUpdateUnit = (
        id: string,
        field: keyof AcUnitDetail,
        value: AcUnitDetail[keyof AcUnitDetail]
    ) => {
        if (field === "quantity") {
            const totalQuantity = calculateTotalQuantity(acUnits);
            const currentUnit = acUnits.find((unit) => unit.id === id);
            const newQuantity = value as number;

            // Jika kuantitas bertambah DAN total sudah mencapai batas
            if (
                newQuantity > (currentUnit?.quantity ?? 0) &&
                totalQuantity >= 10
            ) {
                setIsTotalUnitLimitAlertOpen(true);
                return;
            }
        }

        // GUARD CLAUSE 2: Cek untuk menghapus unit jika kuantitas < 1
        if (field === "quantity" && typeof value === "number" && value < 1) {
            handleRemoveUnit(id);
            return;
        }

        // DEFAULT ACTION: Jika semua pengecekan lolos, lakukan update state
        setAcUnits(
            acUnits.map((unit) =>
                unit.id === id ? { ...unit, [field]: value } : unit
            )
        );
    };

    const isNextDisabled =
        acUnits.length === 0 ||
        acUnits.some((unit) => !unit.acType || !unit.pk || !unit.brand);

    const handleSubmit = () => {
        onSubmit({ acUnits });
    };

    return (
        <div className="bg-white min-h-screen">
            <Header title="Detail Unit AC" isSticky />

            <main>
                <div className="p-4 pb-40 bg-white">
                    {acUnits.length === 0 && (
                        <div className="text-center py-10 px-4 bg-white border shadow-md rounded-lg">
                            <p className="text-gray-600">
                                Kamu belum menambahkan unit AC.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Klik tombol di bawah untuk tambah unit AC.
                            </p>
                        </div>
                    )}

                    {acUnits.map((unit, index) => (
                        <AcUnitCard
                            key={unit.id}
                            unit={unit}
                            index={index}
                            onUpdate={handleUpdateUnit}
                            onRemove={handleRemoveUnit}
                        />
                    ))}

                    <Button
                        className="w-full mt-4 text-secondary border border-secondary cursor-pointer active:scale-95 normal-case"
                        onClick={handleAddUnit}
                    >
                        {acUnits.length === 0
                            ? "[+] Tambah Tipe AC"
                            : "[+] Tambah Tipe AC Lain"}
                    </Button>
                </div>

                {/* Navigation Buttons */}
                <div className="w-full p-4 gap-2 flex fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border pr-5">
                    <Button
                        onClick={onBack}
                        className="w-1/2 h-12 rounded-full text-base text-primary border-primary cursor-pointer border normal-case active:scale-95 !font-[Rubik]"
                    >
                        Kembali
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isNextDisabled}
                        className="w-1/2 h-12 rounded-full font-semibold cursor-pointer active:scale-95 bg-primary text-white normal-case !font-[Rubik] text-base disabled:bg-primary/50 disabled:text-white/50 disabled:cursor-not-allowed"
                    >
                        Lanjut
                    </Button>
                </div>
            </main>

            {/* Limit Unit Alert */}
            <Dialog
                open={isTotalUnitLimitAlertOpen}
                onClose={() => setIsTotalUnitLimitAlertOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className="flex flex-col -space-y-3">
                    <DialogTitle
                        id="alert-dialog-title"
                        className="text-base font-semibold"
                    >
                        Wah, Banyak Banget AC-nya! 😱
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText
                            id="alert-dialog-description"
                            className="text-sm font"
                        >
                            Maaf, untuk saat ini dibatesin 10 unit AC dulu, ya.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setIsTotalUnitLimitAlertOpen(false)}
                            className="cursor-pointer active:scale-95 rounded-sm"
                        >
                            Oke, siap
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    );
}
