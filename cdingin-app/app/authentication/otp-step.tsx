import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import Spinner from '~/components/ui/spinner';

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
          onSubmit={form.handleSubmit((data) => onSubmit({ otp: data.otp }))}
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
                <FormLabel className="font-normal">
                  <p>
                    OTP <span className="text-[#f34b1b]">*</span>
                  </p>{' '}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error && onClearError) onClearError();
                      }}
                      placeholder="••••"
                      className={`w-full border-b ${
                        error
                          ? 'border-[#f34b1b] text-[#f34b1b]'
                          : 'border-[#a7a7a7] text-black'
                      }  pb-2 focus:outline-none focus:border-[#222222] text-lg font-medium tracking-[10px] `}
                      min={0}
                      minLength={4}
                      maxLength={4}
                      inputMode="numeric"
                    />
                    <div className="flex gap-2 items-center min-w-[70px]">
                      {seconds > 0 ? (
                        <>
                          <span className="text-sm font-semibold mt-1">
                            {`0:${seconds.toString().padStart(2, '0')}`}
                          </span>
                          <Spinner size={22} />
                        </>
                      ) : (
                        <Button
                          variant={'secondary'}
                          className="text-white rounded-full text-sm font-semibold cursor-pointer mr-8.5"
                          onClick={() => {
                            setSeconds(30);
                            onResend();
                          }}
                        >
                          Kirim Ulang
                        </Button>
                      )}
                    </div>
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
            disabled={!form.watch('otp') || loading}
            className={`w-full block h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95`}
          >
            Lanjut
          </Button>
        </form>
      </Form>
    </div>
  );
}
