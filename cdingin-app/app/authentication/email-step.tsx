import { Button } from "@mui/material";
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

export default function EmailStep({
    onSubmit,
    error,
    loading,
}: Readonly<{
    onSubmit: (data: { email: string }) => void;
    error: string | undefined;
    loading: boolean;
}>) {
    const form = useForm();

    return (
        <div className="bg-white flex flex-col">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) =>
                        onSubmit({ email: data.email as string })
                    )}
                    className="space-y-6"
                >
                    <h1 className="text-[20px] font-bold text-[#222222] mb-2">
                        Selamat datang di cdingin!
                    </h1>
                    <p className="text-[#666666] text-sm">
                        Masuk atau daftar hanya dalam beberapa langkah mudah.
                    </p>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-normal">
                                    <p>
                                        Email{" "}
                                        <span className="text-[#f34b1b]">
                                            *
                                        </span>
                                    </p>{" "}
                                </FormLabel>
                                <FormControl>
                                    <input
                                        autoComplete="off"
                                        type="email"
                                        {...field}
                                        placeholder="Cth: namamu@domain.com"
                                        className={`w-full border-b ${
                                            error
                                                ? "border-[#f34b1b]"
                                                : "border-[#a7a7a7]"
                                        } pb-2 focus:outline-none focus:border-[#222222] text-[16px] font-medium tracking-wide`}
                                    />
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
                        disabled={!form.watch("email") || loading}
                        className="w-full h-[48px] rounded-full text-center text-base !font-[Rubik] font-semibold cursor-pointer active:scale-95 items-center bg-primary disabled:bg-primary/50 disabled:text-white text-white capitalize"
                    >
                        Lanjut
                    </Button>
                </form>
            </Form>

            {/* Footer */}
            <div className="absolute bottom-9 left-0 right-0 text-center w-full flex gap-1 justify-center items-center">
                <p className="text-[#272727] text-xs">from </p>
                <p className="text-primary font font-medium text-base">
                    Herdi Jaya Service
                </p>
            </div>
        </div>
    );
}
