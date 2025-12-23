import { AirVent } from "lucide-react";
import { acTypes } from "~/customer/order/new/ac-unit-card";

interface AcUnitsCardProps {
    acUnits: {
        id: number;
        acTypeName: string;
        acCapacity: string;
        brand: string;
        quantity: number;
    }[];
    totalUnits: number;
}

export default function AcUnitsCard({
    acUnits,
    totalUnits,
}: Readonly<AcUnitsCardProps>) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
            <div className="flex items-start text-start gap-4">
                <div className="bg-primary w-9 h-9 rounded-full flex items-center justify-center text-center">
                    <AirVent className="text-white w-18" />
                </div>
                <div className="flex flex-col w-full">
                    <h1 className="text-gray-700 text-sm mb-2">
                        Detail Unit AC
                    </h1>
                    {acUnits.map((acUnit) => (
                        <div key={acUnit.id}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h1 className="font-medium text-md">
                                            {
                                                acTypes.find(
                                                    (type) =>
                                                        type.id ===
                                                        acUnit.acTypeName
                                                )?.name
                                            }{" "}
                                            {acUnit.acCapacity}
                                        </h1>
                                        <p className="text-sm font-normal text-gray-700">
                                            {acUnit.brand || "Tidak ditentukan"}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-normal text-sm w-4 text-center text-gray-700">
                                    {acUnit.quantity}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="border-t-[1.5px] border-gray-150 mx-auto w-full">
                        <div className="mt-2 flex items-center justify-between">
                            <h1 className="font-semibold text-md">
                                Total Unit
                            </h1>
                            <span className="text-sm text-center font-semibold w-4">
                                {totalUnits}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
