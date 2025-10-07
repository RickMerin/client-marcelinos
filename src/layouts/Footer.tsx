import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

function Footer() {
  const form = useForm({
    defaultValues: { email: "" },
  });

  function onSubmit(data: any) {
    console.log(data);
  }

  return (
    <footer className="bg-black p-4 text-white space-y-4">
      <div className="container mx-auto flex gap-4">
        <div className="md:basis-1/4">
          <h3 className="yellow text-lg font-bold">
            Marcelino's Resort <br /> Hotel
          </h3>
          <p>
            Experience luxury and comfort at its finest. Subscribe to our
            newsletter for exclusive offers and updates.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 my-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        className="border-none bg-[#1E1E1E]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full text-black text-lg py-6 font-bold">
                Subscribe
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <hr className=" border-white/20 mx-auto" />
      <p className="text-center text-sm text-white/80">
        <small>
          &copy; {new Date().getFullYear()} Marcelino's Place | All Rights
          Reserved.
        </small>
      </p>
    </footer>
  );
}

export default Footer;
