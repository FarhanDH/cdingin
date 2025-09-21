import { Button, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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

export default function OtpStep({
    onSubmit,
    email,
    error,
    onClearError,
    loading,
    onResend,
}: Readonly<{
    onSubmit: (data: { otp: string }) => void;
    email: string | undefined;
    error: string | undefined;
    onClearError: () => void;
    loading: boolean;
    onResend: () => void;
}>) {
    const form = useForm();
    const [seconds, setSeconds] = useState(30);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (seconds > 0) {
            timerRef.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [seconds]);

    // Reset timer when email changes (new OTP sent)
    useEffect(() => {
        setSeconds(30);
    }, [email]);

    return (
        <div className=" bg-white">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) =>
                        onSubmit({ otp: data.otp })
                    )}
                    className="space-y-6"
                >
                    <h1 className="text-[20px] font-bold text-[#222222] mb-2">
                        Cek email, ya
                    </h1>
                    <p className="text-[#666666] text-sm">
                        Kode-nya kami kirim ke {email}
                    </p>
                    <FormField
                        control={form.control}
                        name="otp"
                        rules={{
                            required: true,
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-normal flex items-center justify-between">
                                    <p>
                                        OTP{" "}
                                        <span className="text-[#f34b1b]">
                                            *
                                        </span>
                                    </p>
                                </FormLabel>

                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (error && onClearError)
                                                    onClearError();
                                            }}
                                            placeholder="••••"
                                            className={`w-full border-b ${
                                                error
                                                    ? "border-[#f34b1b] text-[#f34b1b]"
                                                    : "border-[#a7a7a7] text-black"
                                            }  pb-2 focus:outline-none focus:border-[#222222] text-lg font-medium tracking-[10px] `}
                                            min={0}
                                            minLength={4}
                                            maxLength={4}
                                            max={9999}
                                            inputMode="numeric"
                                        />
                                    </div>
                                </FormControl>

                                <FormDescription className="flex justify-between">
                                    <p className="text-[#f34b1b] text-sm">
                                        {error}
                                    </p>
                                    {/* Resend OTP Button */}
                                    <div className="gap-2 items-center -mt-15">
                                        {seconds > 0 ? (
                                            <div className="flex gap-2 mt-4 items-center">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {`0:${seconds
                                                        .toString()
                                                        .padStart(2, "0")}`}
                                                </span>
                                                <CircularProgress
                                                    size={20}
                                                    className="text-secondary"
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                className="bg-secondary normal-case w-24 text-white rounded-full text-xs font-semibold cursor-pointer p-3 !font-[Rubik] active:scale-95"
                                                onClick={() => {
                                                    setSeconds(30);
                                                    onResend();
                                                }}
                                            >
                                                Kirim Ulang
                                            </Button>
                                        )}
                                    </div>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Open email button */}
                    <Button
                        type="button"
                        className="-mt-5 rounded-full text-center text-md font-semibold cursor-pointer active:scale-95 items-center text-primary normal-case border border-primary !font-[Rubik] bg-white"
                        onClick={() => {
                            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                                window.open("message://", "_blank");
                            }
                            // // window.location.href =
                            //     "https://mail.google.com/mail/mu/mp/679/#";
                            else
                                window.open(
                                    "https://mail.google.com/mail/mu/mp/679/#",
                                    "_blank"
                                );
                        }}
                    >
                        Buka Email
                    </Button>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!form.watch("otp") || loading}
                        className={`bg-primary normal-case text-white w-full block h-[48px] rounded-full text-center text-[16px] font-semibold cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed !font-[Rubik]`}
                    >
                        Lanjut
                    </Button>
                </form>
            </Form>
        </div>
    );
}
