import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@mui/material";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import technicianImg from "~/assets/technician-smile-phone-nobg.png";
import { customToastStyle } from "~/common/custom-toast-style";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import Spinner from "~/components/ui/spinner";
import AcTypeStep from "~/customer/order/new/ac-type-step";
import LocationStep from "~/customer/order/new/location-step";
import ProblemsStep from "~/customer/order/new/problem-step";
import PropertyTypeStep from "~/customer/order/new/property-type-step";
import SummaryStep from "~/customer/order/new/summary.step";
import type {
    CreateOrderRequestDto,
    OrderFormData,
    OrderItem,
    OrderStep,
} from "~/types/order.types";
import type { Route } from "./+types/new-order";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Buat Pesanan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

// Order Steps
const steps: OrderStep[] = [
    "ac-problems",
    "location",
    "ac-type",
    "property-type",
    "summary",
];

type Step = (typeof steps)[number];

const mapFormDataToApiRequest = (
    formData: Partial<OrderFormData>
): CreateOrderRequestDto => {
    if (
        !formData.problems ||
        !formData.serviceLocation ||
        !formData.propertyType ||
        !formData.acUnits ||
        !formData.serviceDate
    ) {
        throw new Error("Data form tidak lengkap");
    }

    return {
        acProblems: formData.problems,
        serviceLocation: {
            latitude: formData.serviceLocation.latitude,
            longitude: formData.serviceLocation.longitude,
            address: formData.serviceLocation.address,
            note: formData.serviceLocation.note,
        },
        propertyType: formData.propertyType.name,
        floor: formData.floor ?? 0,
        acUnits: formData.acUnits.map((unit) => ({
            acTypeId: unit.acType?.id || "",
            acCapacity: unit.pk,
            brand: unit.brand,
            quantity: unit.quantity,
        })),
        serviceDate: formData.serviceDate,
        note: formData.note,
    } satisfies CreateOrderRequestDto;
};

type SuccessState = "idle" | "animating" | "showingSheet";

export default function NewOrder() {
    // State untuk menyimpan semua data dari setiap step
    const [formData, setFormData] = useState<Partial<OrderFormData>>({});
    const [loading, setLoading] = useState(false);
    const [successState, setSuccessState] = useState<SuccessState>("idle");
    // State to track the current step
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const currentStep: Step = steps[currentStepIndex];
    const [order, setOrder] = useState<OrderItem | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (
            currentStep === "summary" &&
            formData.acUnits &&
            formData.acUnits.length === 0
        ) {
            navigate("/orders");
        }
    }, [formData.acUnits, currentStep, navigate]);

    useEffect(() => {
        // If the state is 'animating', wait for a few seconds and then change to 'showingSheet'
        if (successState === "animating") {
            const timer = setTimeout(() => {
                setSuccessState("showingSheet");
            }, 4000);

            // Clean up function to clear the timer when the component is unmounted
            return () => clearTimeout(timer);
        }
    }, [successState]);

    // Fungsi untuk pindah ke step berikutnya
    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    // Fungsi untuk kembali ke step sebelumnya
    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const navigateToStep = (stepName: Step) => {
        const stepIndex = steps.indexOf(stepName);
        if (stepIndex !== -1) {
            setCurrentStepIndex(stepIndex);
        }
    };

    const handleProblemsSubmit = (data: { problems: string[] }) => {
        setFormData((prev) => ({ ...prev, problems: data.problems }));
        handleNext();
    };

    const handleLocationSubmit = (data: {
        note: string;
        address: string;
        latitude: number;
        longitude: number;
    }) => {
        setFormData((prev) => ({ ...prev, serviceLocation: data }));
        handleNext();
    };

    const handleAcTypeSubmit = (data: {
        acUnits: OrderFormData["acUnits"];
    }) => {
        setFormData((prev) => ({ ...prev, acUnits: data.acUnits }));
        handleNext();
    };

    const handleUpdateAcUnitQuantity = (
        unitId: string,
        newQuantity: number
    ) => {
        // If quantity less than 1, delete item from list
        if (newQuantity < 1) {
            setFormData((prev) => ({
                ...prev,
                acUnits: prev.acUnits?.filter((unit) => unit.id !== unitId),
            }));
            return;
        }

        // If not, update quantity unit based on id
        setFormData((prev) => ({
            ...prev,
            acUnits: prev.acUnits?.map((unit) =>
                unit.id === unitId ? { ...unit, quantity: newQuantity } : unit
            ),
        }));
    };

    const handlePropertyTypeSubmit = (data: {
        propertyType: { id: string; name: string } | null;
        floor: number;
    }) => {
        setFormData((prev) => ({
            ...prev,
            propertyType: {
                id: data.propertyType?.id || "",
                name: data.propertyType?.name || "",
            },
            floor: data.floor,
        }));

        handleNext();
    };

    // Fungsi baru untuk menangani konfirmasi pesanan terakhir
    const handleConfirmOrder = async (data: {
        note: string;
        serviceDate: Date;
    }) => {
        const completeFormData = {
            ...formData,
            note: data.note,
            serviceDate: data.serviceDate,
        };

        try {
            // 1. Mapping data
            setLoading(true);
            const apiPayload = mapFormDataToApiRequest(completeFormData);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/orders`,
                apiPayload,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 201) {
                setSuccessState("animating");
                setLoading(false);
            }
            setOrder(response.data.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                toast(
                    "Yah, kayaknya ada yang salah. Coba lagi nanti, ya",
                    customToastStyle
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Render komponen step yang sesuai
    const renderStep = () => {
        switch (currentStep) {
            case "ac-problems":
                return (
                    <ProblemsStep
                        initialProblems={formData.problems || []}
                        onSubmit={handleProblemsSubmit}
                    />
                );
            case "location":
                return (
                    <LocationStep
                        initialLocation={formData.serviceLocation}
                        onSubmit={handleLocationSubmit}
                        onBack={handlePrev}
                    />
                );
            case "ac-type":
                return (
                    <AcTypeStep
                        initialAcUnits={formData.acUnits || []}
                        onSubmit={handleAcTypeSubmit}
                        onBack={handlePrev}
                    />
                );
            case "property-type":
                return (
                    <PropertyTypeStep
                        initialPropertyType={formData.propertyType}
                        initialFloor={formData.floor}
                        onSubmit={handlePropertyTypeSubmit}
                        onBack={handlePrev}
                    />
                );
            case "summary":
                return (
                    <SummaryStep
                        formData={formData}
                        onConfirm={handleConfirmOrder}
                        onUpdateQuantity={handleUpdateAcUnitQuantity}
                        navigateToStep={navigateToStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`relative max-w-lg mx-auto bg-gray-50 ${
                successState !== "idle" ? "overflow-hidden" : ""
            }`}
        >
            {loading && (
                <div
                    className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
                        loading ? "bg-black/50" : ""
                    }`}
                >
                    <Dialog open={loading} modal>
                        <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                            <Spinner size={30} className="text-primary" />
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <main>{successState === "idle" && renderStep()}</main>

            {successState === "animating" && (
                <div className="h-screen flex items-center justify-center">
                    <DotLottieReact
                        src="https://lottie.host/c68a2567-7d30-4c79-9b82-ba4f7edca4fc/JnzotXvT5y.lottie"
                        loop
                        autoplay
                        style={{ width: "300px", height: "300px" }}
                    />
                </div>
            )}

            {/* Success Drawer if order created */}
            <Sheet open={successState === "showingSheet"}>
                <SheetContent
                    isXIconVisible={false}
                    side="bottom"
                    className="border-t-white rounded-t-2xl max-w-lg mx-auto"
                    // Mencegah sheet ditutup oleh interaksi luar
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="text-center"></SheetHeader>
                    <SheetFooter className="text-center">
                        <img
                            src={technicianImg}
                            alt="Teknisi Cdingin"
                            className="w-48 mx-auto" // Ukuran disesuaikan
                        />
                        <SheetTitle className="text-2xl font-bold pt-4">
                            Sip, orderan kamu udah masuk!
                        </SheetTitle>
                        <SheetDescription className="text-md text-gray-600 mb-2">
                            Tunggu konfirmasi dari teknisi, ya.
                        </SheetDescription>
                        <Button
                            onClick={() => navigate(`/order/${order?.id}`)}
                            className="w-full h-12 rounded-full text-[16px] font-semibold active:scale-95 cursor-pointer bg-primary text-white normal-case !font-[Rubik] text-base"
                        >
                            Oke, siap
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
