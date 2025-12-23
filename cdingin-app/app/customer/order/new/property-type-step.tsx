import { Button } from "@mui/material";
import { Label } from "@radix-ui/react-label";
import { useState, type JSX } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

type PropertyType = {
    id: string;
    name: string;
    icon?: JSX.Element;
};

interface PropertyTypeStepProps {
    initialPropertyType: { id: string; name: string } | null | undefined;
    initialFloor: number | undefined;
    onSubmit: (data: { propertyType: PropertyType; floor: number }) => void;
    onBack: () => void;
}

const propertyTypes = [
    {
        id: "home",
        name: "Rumah",
    },
    {
        id: "boarding-house",
        name: "Kost",
        //
    },
    {
        id: "hotel",
        name: "Hotel",
    },
    {
        id: "office",
        name: "Kantor",
    },
    {
        id: "shop",
        name: "Toko",
    },
];

const floorOptions = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * A step in the new order flow that asks for the property type.
 *
 * @param {Object} props - The props passed to the component.
 * @param {Function} props.onSubmit - The function to call when the form is submitted.
 * @param {Function} props.onBack - The function to call when the back button is clicked.
 * @param {Object} props.initialPropertyType - The initial property type.
 * @param {number} props.initialFloor - The initial floor.
 * @returns {React.ReactElement} - The component element.
 */
export default function PropertyTypeStep({
    onSubmit,
    onBack,
    initialPropertyType,
    initialFloor,
}: Readonly<PropertyTypeStepProps>) {
    const [selectedProperty, setSelectedProperty] =
        useState<PropertyType | null>(
            () =>
                propertyTypes.find((p) => p.id === initialPropertyType?.id) ||
                null
        );

    const [floor, setFloor] = useState(initialFloor || "");

    const handleSubmit = () => {
        if (selectedProperty && floor) {
            onSubmit({ propertyType: selectedProperty, floor: Number(floor) });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 pb-28 pt-4">
                <h1 className="text-xl font-semibold mb-4">
                    Tipe bangunannya gimana?
                </h1>
                <RadioGroup
                    value={selectedProperty?.id}
                    onValueChange={(id) => {
                        const property = propertyTypes.find((p) => p.id === id);
                        setSelectedProperty(property || null);
                    }}
                    className="grid grid-cols-1 gap-2"
                >
                    {propertyTypes.map((property) => (
                        <Label
                            key={property.id}
                            htmlFor={property.id}
                            className={`flex items-center gap-3 border-[1.5px] p-3 rounded-lg cursor-pointer ${
                                selectedProperty?.id === property.id
                                    ? "border-primary bg-secondary/10"
                                    : "border-gray-300"
                            }`}
                        >
                            {/* {property.icon} */}
                            <p className="font-medium text-xl flex-1">
                                {property.name}
                            </p>
                            <RadioGroupItem
                                value={property.id}
                                id={property.id}
                                className="flex items-center justify-center size-7"
                            />
                        </Label>
                    ))}
                </RadioGroup>

                {/* Floor Input */}
                <h1 className="text-xl font-semibold my-4">
                    Di lantai Berapa AC-nya?
                </h1>
                <Select
                    value={floor ? String(floor) : ""}
                    onValueChange={(value) => setFloor(value)}
                >
                    <SelectTrigger className="w-full text-base font-medium focus:outline-none focus:border-[#222222] border p-3 rounded-lg h-auto border-gray-300 cursor-pointer">
                        <SelectValue placeholder="Pilih Lantai" />
                    </SelectTrigger>
                    <SelectContent className="h-[200px]">
                        {floorOptions.map((floorNum) => (
                            <SelectItem
                                key={floorNum}
                                value={String(floorNum)}
                                className="cursor-pointer"
                            >
                                Lantai {floorNum}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full p-4 gap-2 flex fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border pr-5">
                <Button
                    type="button"
                    onClick={onBack}
                    className="w-1/2 h-[48px] border border-primary rounded-full text-base font-semibold text-primary cursor-pointer !font-[Rubik] active:scale-95 normal-case"
                >
                    Kembali
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!selectedProperty || !floor}
                    className="w-1/2 h-[48px] rounded-full text-base font-semibold cursor-pointer !font-[Rubik] active:scale-95 bg-primary text-white disabled:bg-primary/50 disabled:text-white/50 disabled:cursor-not-allowed normal-case"
                >
                    Lanjut
                </Button>
            </div>
        </div>
    );
}
