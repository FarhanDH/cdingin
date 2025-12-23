import { Button } from "@mui/material";
import { ID } from "country-flag-icons/react/3x2";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import phoneWhatsapp from "public/whatsapp-telephone.png";

export default function PhoneStep({
    onSubmit,
    loading,
    error,
}: Readonly<{
    onSubmit: (data: { phone: string }) => void;
    loading: boolean;
    error: string | undefined;
}>) {
    const form = useForm();

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsOpen(true), 850);
    }, []);

    const onOpenChange = (isOpen: boolean) => {
        setIsOpen(isOpen);
    };

    return (
        <div className=" bg-white">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) =>
                        onSubmit({ phone: data.phone })
                    )}
                    className="space-y-6"
                >
                    <h1 className="text-[20px] font-bold text-[#222222] mb-2">
                        Nomor HP kamu berapa?
                    </h1>
                    <p className="text-[#666666] text-sm">
                        Boleh tau nomor HP kamu? Biar teknisi bisa hubungi kamu!
                    </p>
                    <FormField
                        control={form.control}
                        name="phone"
                        rules={{
                            required: true,
                            pattern: {
                                value: /^[0-9]+$/,
                                message: "Nomor HP harus berupa angka",
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-normal">
                                    <p>
                                        Nomor HP{" "}
                                        <span className="text-[#f34b1b]">
                                            *
                                        </span>
                                    </p>
                                </FormLabel>
                                <FormControl>
                                    <div className="flex gap-3">
                                        <div className="flex gap-1 justify-center items-center bg-gray-100 rounded-full border-[0.5px] border-gray-300 mt-1 h-7 w-19">
                                            <ID
                                                title="Indonesia"
                                                className="w-3.5"
                                            />
                                            <p className="text-sm font-medium">
                                                +62
                                            </p>
                                        </div>
                                        <input
                                            type="tel"
                                            {...field}
                                            placeholder="81x-xxx-xxx"
                                            className="w-full border-b border-[#a7a7a7] pb-2 focus:outline-none focus:border-[#222222] font-medium text-lg tracking-wide"
                                            min={0}
                                            minLength={8}
                                            maxLength={15}
                                        />
                                    </div>
                                </FormControl>
                                {error && (
                                    <FormDescription className="text-[#f34b1b] text-sm ">
                                        {error}
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={!form.watch("phone") || loading}
                        className={`bg-primary normal-case text-white !font-[Rubik] w-full block h-[48px] rounded-full text-center text-[16px] font-semibold cursor-pointer active:scale-95`}
                    >
                        Lanjut
                    </Button>
                </form>
            </Form>

            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto text-center"
                    // Prevent close sheet beyond interaction
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="">
                        <div className="rounded-4xl">
                            <img
                                src={phoneWhatsapp}
                                alt="Ilustrasi Peta"
                                className="w-full mx-auto"
                            />
                        </div>
                        <SheetTitle className="text-xl font-bold">
                            Pastiin nomor HP-nya nyambung ke WhatsApp ya
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Teknisi biasanya hubungi pelanggan lewat WhatsApp,
                            biar komunikasi lebih gampang dan pesananmu cepet
                            diproses.
                        </SheetDescription>
                        <Button
                            onClick={() => setIsOpen(false)}
                            className="bg-primary text-base text-white normal-case !font-[Rubik] w-full h-12 rounded-full text-md font-semibold mt-6 active:scale-95"
                        >
                            Oke, siap
                        </Button>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </div>
    );
}
