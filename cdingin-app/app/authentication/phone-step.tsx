import { ID } from 'country-flag-icons/react/3x2';
import { useState } from 'react';
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

export default function PhoneStep({
  onSubmit,
  loading,
}: Readonly<{
  onSubmit: (data: { phone: string }) => void;
  loading: boolean;
}>) {
  const form = useForm();

  //   error state
  const [error, setError] = useState('');

  return (
    <div className=" bg-white">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit({ phone: data.phone }),
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
                message: 'Nomor HP harus berupa angka',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  <p>
                    Nomor HP <span className="text-[#f34b1b]">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <div className="flex gap-3">
                    <div className="flex gap-1 justify-center items-center bg-gray-100 rounded-full border-[0.5px] border-gray-300 mt-1 h-7 w-19">
                      <ID title="Indonesia" className="w-3.5" />
                      <p className="text-sm font-medium">+62</p>
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
            disabled={!form.watch('phone') || loading}
            className={`w-full block h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95`}
          >
            Lanjut
          </Button>
        </form>
      </Form>
    </div>
  );
}
