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
    <div className="bg-white">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit({ email: data.email as string }),
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
                    Email <span className="text-[#f34b1b]">*</span>
                  </p>{' '}
                </FormLabel>
                <FormControl>
                  <input
                    type="email"
                    {...field}
                    placeholder="Cth: namamu@domain.com"
                    className={`w-full border-b ${
                      error ? 'border-[#f34b1b]' : 'border-[#a7a7a7]'
                    } pb-2 focus:outline-none focus:border-[#222222] text-lg font-medium tracking-wide`}
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
            disabled={!form.watch('email') || loading}
            className="w-full h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95 items-center"
          >
            Lanjut
          </Button>
        </form>
      </Form>
    </div>
  );
}
