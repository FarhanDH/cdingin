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

export default function NameStep({
  onSubmit,
  error,
  loading,
}: Readonly<{
  onSubmit: (data: { name: string }) => void;
  error: string | undefined;
  loading: boolean;
}>) {
  const form = useForm();

  return (
    <div className=" bg-white">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit({ name: data.name }))}
          className="space-y-6"
        >
          <h1 className="text-[20px] font-bold text-[#222222] mb-2">
            Nama kamu siapa?
          </h1>
          <p className="text-[#666666] text-sm">
            Biar lebih akrab, boleh tau nama kamu?
          </p>
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: true,
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message:
                  'Nama hanya boleh berisi huruf alfabet, tanpa emoji/simbol',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">
                  <p>
                    Nama <span className="text-[#f34b1b]">*</span>
                  </p>{' '}
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    {...field}
                    placeholder="Huruf alfabet, tanpa emoji/simbol"
                    className="w-full border-b border-[#a7a7a7] pb-2 focus:outline-none focus:border-[#222222] font-medium text-lg"
                    // pattern="^[A-Za-z\s]+$"
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
            disabled={!form.watch('name') || loading}
            className={`w-full block h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95`}
          >
            Lanjut
          </Button>
        </form>
      </Form>
    </div>
  );
}
