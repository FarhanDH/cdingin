import { IconButton } from "@mui/material";
import { Minus, Plus, Trash2 } from "lucide-react";
import cassetteACIcon from "public/cassette-ac.png";
import splitACIcon from "public/split-ac.png";
import standingACIcon from "public/standing-ac.png";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import type { AcUnitDetail } from "~/types/order.types";

// Daftar pilihan untuk dropdown
export const acTypes = [
    {
        id: "split-ac",
        name: "AC Split",
        icon: splitACIcon,
    },
    {
        id: "standing-ac",
        name: "AC Standing",
        icon: standingACIcon,
    },
    {
        id: "cassette-ac",
        name: "AC Cassette",
        icon: cassetteACIcon,
    },
];
const pkOptions = [
    "0.5 PK",
    "1 PK",
    "1.5 PK",
    "2 PK",
    "2.5 PK",
    "3 PK",
    "5 PK",
];
const brandOptions = [
    "Panasonic",
    "LG",
    "Daikin",
    "Samsung",
    "Sharp",
    "Polytron",
    "Gree",
    "TCL",
    "Mitsubishi",
    "Aqua",
];

interface AcUnitCardProps {
    unit: AcUnitDetail;
    index: number;
    onUpdate: (
        id: string,
        field: keyof AcUnitDetail,
        value: AcUnitDetail[keyof AcUnitDetail]
    ) => void;
    onRemove: (id: string) => void;
}

export default function AcUnitCard({
    unit,
    index,
    onUpdate,
    onRemove,
}: Readonly<AcUnitCardProps>) {
    return (
        <div className="bg-white border p-4 rounded-xl shadow-md mb-4 w-full space-y-4 max-w-lg mx-auto">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Unit AC #{index + 1}</h3>
                <IconButton
                    className="cursor-pointer hover:text-red-600 hover:bg-red-50"
                    onClick={() => onRemove(unit.id)}
                    size="small"
                >
                    <Trash2 className="w-5 h-5 text-red-500" />
                </IconButton>
            </div>

            {/* Tipe AC */}
            <div>
                <label className="text-sm font-medium">
                    <p>
                        Tipe AC <span className="text-[#f34b1b]">*</span>
                    </p>{" "}
                </label>
                <Select
                    value={unit.acType?.id}
                    onValueChange={(selectedId) => {
                        const selectedAcType = acTypes.find(
                            (ac) => ac.id === selectedId
                        );
                        // Ensure it's not undefined before update
                        if (selectedAcType) {
                            onUpdate(unit.id, "acType", selectedAcType);
                        }
                    }}
                >
                    <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Pilih Tipe AC" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                        {acTypes.map((acType) => (
                            <SelectItem
                                key={acType.id}
                                value={acType.id}
                                className="cursor-pointer"
                            >
                                <img
                                    className="inline-block mr-2 w-6 h-6"
                                    src={acType.icon}
                                    alt={acType.name}
                                />
                                {acType.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* PK & Merek dalam satu baris */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">
                        <p>
                            Kapasitas (PK){" "}
                            <span className="text-[#f34b1b]">*</span>
                        </p>{" "}
                    </label>
                    <Select
                        value={unit.pk}
                        onValueChange={(value) =>
                            onUpdate(unit.id, "pk", value)
                        }
                    >
                        <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Pilih PK" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            {pkOptions.map((pk) => (
                                <SelectItem
                                    key={pk}
                                    value={pk}
                                    className="cursor-pointer"
                                >
                                    {pk}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">
                        <p>
                            Merek <span className="text-[#f34b1b]">*</span>
                        </p>{" "}
                    </label>
                    <Select
                        value={unit.brand}
                        onValueChange={(value) =>
                            onUpdate(unit.id, "brand", value)
                        }
                    >
                        <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue placeholder="Pilih Merek" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                            {brandOptions.map((brand) => (
                                <SelectItem
                                    key={brand}
                                    value={brand}
                                    className="cursor-pointer"
                                >
                                    {brand}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Jumlah Unit */}
            <div className="flex justify-between items-center pt-2">
                <label className="font-medium">Jumlah Unit</label>
                <div className="flex items-center gap-4">
                    <IconButton
                        className="rounded-full border border-primary text-primary cursor-pointer active:scale-95"
                        size="medium"
                        onClick={() =>
                            onUpdate(unit.id, "quantity", unit.quantity - 1)
                        }
                    >
                        <Minus className="w-4 h-4" />
                    </IconButton>
                    <span className="font-semibold text-lg">
                        {unit.quantity}
                    </span>
                    <IconButton
                        className="rounded-full border border-primary text-primary cursor-pointer active:scale-95"
                        size="medium"
                        onClick={() =>
                            onUpdate(unit.id, "quantity", unit.quantity + 1)
                        }
                    >
                        <Plus className="w-4 h-4" />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}
