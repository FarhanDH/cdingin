import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Button } from "../../ui/Button";

interface ProblemsStepProps {
    initialProblems: string[];
    onSubmit: (data: { problems: string[] }) => void;
}

const AC_SERVICES = [
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

export default function ProblemsStep({ initialProblems, onSubmit }: ProblemsStepProps) {
    const [selectedProblems, setSelectedProblems] = useState<string[]>(initialProblems);
    const [otherProblem, setOtherProblem] = useState("");
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    useEffect(() => {
        const otherInitial = initialProblems.find(
            (p) => !AC_SERVICES.some((s) => s.name === p)
        );
        if (otherInitial) {
            setIsOtherSelected(true);
            setOtherProblem(otherInitial);
            if (!selectedProblems.includes("Lainnya")) {
                setSelectedProblems((prev) => [...prev, "Lainnya"]);
            }
        }
    }, []);

    const toggleProblem = (problemName: string) => {
        setSelectedProblems((prev) =>
            prev.includes(problemName)
                ? prev.filter((p) => p !== problemName)
                : [...prev, problemName]
        );
    };

    const handleToggle = (serviceName: string) => {
        if (serviceName === "Lainnya") {
            const newIsOtherSelected = !isOtherSelected;
            setIsOtherSelected(newIsOtherSelected);
            if (!newIsOtherSelected) {
                setOtherProblem("");
                setSelectedProblems((prev) => prev.filter((p) => p !== "Lainnya"));
            } else {
                if (!selectedProblems.includes("Lainnya")) {
                    setSelectedProblems(prev => [...prev, "Lainnya"]);
                }
            }
        } else {
            toggleProblem(serviceName);
        }
    };

    const handleSubmit = () => {
        let finalProblems = selectedProblems.filter(p => p !== "Lainnya");
        if (isOtherSelected && otherProblem.trim() !== "") {
            finalProblems = [...finalProblems, otherProblem.trim()];
        }
        onSubmit({ problems: finalProblems });
    };

    const isSubmitDisabled =
        selectedProblems.filter(p => p !== "Lainnya").length === 0 &&
        (!isOtherSelected || otherProblem.trim() === "");

    return (
        <View className="flex-1 bg-white relative">
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xl font-semibold mb-4 text-[#222222]">
                    Pilih layanan / keluhan AC Anda
                </Text>

                {AC_SERVICES.map((service) => {
                    const isChecked = service.name === "Lainnya"
                        ? isOtherSelected
                        : selectedProblems.includes(service.name);

                    return (
                        <Pressable
                            key={service.id}
                            onPress={() => handleToggle(service.name)}
                            className={`flex-row items-center gap-3 border p-3 rounded-lg mb-2 ${isChecked
                                ? "bg-secondary/10 border-primary"
                                : "bg-white border-gray-300"
                                }`}
                        >
                            <View className={`w-5 h-5 border rounded items-center justify-center ${isChecked ? "bg-primary border-primary" : "border-gray-400 bg-white"
                                }`}>
                                {isChecked && <View className="w-2.5 h-2.5 bg-white rounded-sm" />}
                            </View>
                            <Text className="text-gray-700 text-lg font-normal">
                                {service.name}
                            </Text>
                        </Pressable>
                    );
                })}

                {isOtherSelected && (
                    <View className="mt-4 p-3 border border-primary rounded-lg bg-secondary/10">
                        <Text className="font-semibold text-gray-800 mb-2">
                            Ceritain keluhan AC anda
                        </Text>
                        <TextInput
                            value={otherProblem}
                            onChangeText={setOtherProblem}
                            placeholder="Contoh: AC mengeluarkan suara aneh seperti..."
                            multiline
                            className="bg-white p-3 rounded border border-gray-200 text-base h-24 text-top"
                            textAlignVertical="top"
                        />
                    </View>
                )}
            </ScrollView>

            <View className="p-4 bg-white border-t border-gray-200">
                <Button
                    variant="primary"
                    disabled={isSubmitDisabled}
                    onPress={handleSubmit}
                    className="w-full h-[48px] rounded-full active:scale-95"
                >
                    <Text className="text-white font-semibold text-base">Lanjut</Text>
                </Button>
            </View>
        </View>
    );
}
