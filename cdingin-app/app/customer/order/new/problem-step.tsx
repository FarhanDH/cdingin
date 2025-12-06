import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const acServices = [
    { id: 1, name: "Cuci AC" },
    { id: 2, name: "Pasang AC" },
    { id: 3, name: "Bongkar AC" },
    { id: 4, name: "Bongkar & pasang AC" },
    { id: 5, name: "AC tidak dingin" },
    { id: 6, name: "Air netes / bocor" },
    { id: 7, name: "Suaranya berisik" },
    { id: 8, name: "Udara lemah" },
    { id: 9, name: "AC bau tidak sedap" },
    { id: 10, name: "AC tidak menyala / mati mendadak" },
    { id: 11, name: "Lainnya" },
];

export default function ProblemsStep({
    initialProblems,
    onSubmit,
}: Readonly<{
    initialProblems: string[];
    onSubmit: (data: { problems: string[] }) => void;
}>) {
    const [selectedProblems, setSelectedProblems] =
        useState<string[]>(initialProblems);
    const [otherProblem, setOtherProblem] = useState("");
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    const toggleProblem = (problemName: string) => {
        setSelectedProblems((prev) =>
            prev.includes(problemName)
                ? prev.filter((p) => p !== problemName)
                : [...prev, problemName]
        );
    };

    useEffect(() => {
        const otherInitial = initialProblems.find(
            (p) => !acServices.some((s) => s.name === p)
        );
        if (otherInitial) {
            setIsOtherSelected(true);
            setOtherProblem(otherInitial);
            // Pastikan "Lainnya" ada di selectedProblems untuk menjaga checkbox tetap tercentang
            if (!selectedProblems.includes("Lainnya")) {
                setSelectedProblems((prev) => [...prev, "Lainnya"]);
            }
        }
    }, [initialProblems, selectedProblems]);

    const handleSubmit = () => {
        let finalProblems = selectedProblems.filter((p) => p !== "Lainnya");
        if (isOtherSelected && otherProblem.trim() !== "") {
            finalProblems = [...finalProblems, otherProblem.trim()];
        }
        onSubmit({ problems: finalProblems });
    };

    return (
        <>
            <div className="p-4 pb-28 bg-white">
                <h1 className="text-xl font-semibold mb-4">
                    Pilih layanan / keluhan AC Anda
                </h1>
                {acServices.map((service) => {
                    const isChecked =
                        service.name === "Lainnya"
                            ? isOtherSelected
                            : selectedProblems.includes(service.name);

                    const handleToggle = () => {
                        if (service.name === "Lainnya") {
                            setIsOtherSelected(!isOtherSelected);
                            // If "Lainnya" is not selected, clear the state related to it
                            if (isOtherSelected) {
                                setOtherProblem(""); // Clear the textarea
                                // Remove "Lainnya" from selectedProblems
                                setSelectedProblems((prev) =>
                                    prev.filter((p) => p !== "Lainnya")
                                );
                            }
                        } else {
                            toggleProblem(service.name);
                        }
                    };

                    return (
                        <Label
                            key={service.id}
                            htmlFor={`checkbox-${service.id}`}
                            className={`flex items-center gap-3 border border-gray-300 p-3 rounded-lg mb-2 cursor-pointer ${
                                isChecked
                                    ? "bg-secondary/10 border-primary"
                                    : "bg-white"
                            }`}
                        >
                            <Checkbox
                                id={`checkbox-${service.id}`}
                                checked={isChecked}
                                onCheckedChange={handleToggle}
                                className="h-5 w-5"
                            />
                            <span className="text-gray-700 text-lg">
                                {service.name}
                            </span>
                        </Label>
                    );
                })}
                {isOtherSelected && (
                    <div className="mt-4 p-3 border border-primary rounded-lg bg-secondary/10">
                        <Label
                            htmlFor="other-problem"
                            className="font-semibold text-gray-800"
                        >
                            Ceritain keluhan AC anda
                        </Label>
                        <Textarea
                            id="other-problem"
                            value={otherProblem}
                            onChange={(e) => setOtherProblem(e.target.value)}
                            placeholder="Contoh: AC mengeluarkan suara aneh seperti..."
                            className="mt-2 bg-white"
                        />
                    </div>
                )}
            </div>

            {/* Tombol Navigasi yang Terpusat */}
            <div className="w-full p-4 fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border">
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={
                        selectedProblems.filter((p) => p !== "Lainnya")
                            .length === 0 &&
                        (!isOtherSelected || otherProblem.trim() === "")
                    }
                    className="w-full h-12 rounded-full text-[16px] font-semibold mt-4 cursor-pointer active:scale-95 items-center bg-primary text-white capitalize disabled:bg-primary/50 disabled:text-white"
                >
                    Lanjut
                </Button>
            </div>
        </>
    );
}
